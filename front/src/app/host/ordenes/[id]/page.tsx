"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/NavBar";
import HostSidebar from "@/components/host/HostSidebar";
import { useAuth } from "@/context/AuthContext";
import { getHostOrder, deliverPedido, addPedido, closeOrder } from "@/services/hostService";
import { getPlatos } from "@/services/platosService";
import { FiUser, FiUsers, FiClock, FiCheckCircle, FiCircle, FiPlus, FiX } from "react-icons/fi";
import Swal from "sweetalert2";

export default function HostOrdenPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [platos, setPlatos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPlato, setSelectedPlato] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [showPlatoSearch, setShowPlatoSearch] = useState(false);
  const [closing, setClosing] = useState(false);
  const { userData, isAuthReady } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!userData || userData.user.role !== "HOST") {
      router.push("/");
      return;
    }
    fetchOrder();
    fetchPlatos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, userData]);

  const fetchOrder = async () => {
    try {
      const data = await getHostOrder(id as string);
      setOrder(data);
    } catch {
      console.error("Error al cargar la orden");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatos = async () => {
    try {
      const data = await getPlatos(1, 1000);
      setPlatos(data);
    } catch {
      console.error("Error al cargar platos");
    }
  };

  const handleDeliver = async (pedidoId: string) => {
    try {
      await deliverPedido(pedidoId);
      await Swal.fire({
        icon: "success",
        title: "Platillo entregado",
        timer: 1000,
        showConfirmButton: false,
      });
      fetchOrder();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo marcar el platillo como entregado",
        confirmButtonColor: "#56070C",
      });
    }
  };

  const handleAddPedido = async () => {
    if (!selectedPlato) return;
    try {
      await addPedido(id as string, selectedPlato.id, quantity);
      await Swal.fire({
        icon: "success",
        title: "Platillo agregado",
        timer: 1000,
        showConfirmButton: false,
      });
      setSelectedPlato(null);
      setSearch("");
      setQuantity(1);
      setShowPlatoSearch(false);
      fetchOrder();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo agregar el platillo",
        confirmButtonColor: "#56070C",
      });
    }
  };

  const handleCloseOrder = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar la mesa?",
      text: "Se calculará el total a cobrar",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#56070C",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setClosing(true);
      const data = await closeOrder(id as string);
      await Swal.fire({
  icon: "success",
  title: "Mesa cerrada",
  html: `
        <div class="text-left mt-2">
          <p><strong>Total platillos:</strong> $${Number(data.totalPedidos).toFixed(2)}</p>
          <p><strong>Seña ya pagada:</strong> -$${Number(data.depositAmount).toFixed(2)}</p>
          <hr class="my-2"/>
          <p class="text-lg"><strong>Total a cobrar:</strong> $${Number(data.totalRestante).toFixed(2)}</p>
        </div>
        `,
  confirmButtonColor: "#56070C",
  confirmButtonText: "Aceptar",
  });
      
  router.push("/host/reservas");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cerrar la orden",
        confirmButtonColor: "#56070C",
      });
    } finally {
      setClosing(false);
    }
  };

  if (!isAuthReady || !userData) return null;

  const reservation = order?.reservation;
  const pedidos = reservation?.pedidos || [];
  const entregados = pedidos.filter((p: any) => p.status === "ENTREGADO").length;
  const platosFiltrados = platos.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen mt-20 w-full bg-[#F6E3D9] flex">
        <HostSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 px-6 py-10">
          {loading ? (
            <p className="text-gray-500 animate-pulse">Cargando orden...</p>
          ) : !order ? (
            <p className="text-gray-400">Orden no encontrada</p>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-semibold text-red-950">
                    Orden de Mesa
                  </h1>
                  <p className="mt-1 text-gray-500">
                    Check-in:{" "}
                    {new Date(order.checkInTime).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={handleCloseOrder}
                  disabled={closing}
                  className="py-2 px-6 bg-linear-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-xl shadow hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  Cerrar Mesa
                </button>
              </div>

              {/* Info de la reserva */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-[#F6E3D9] p-2 rounded-xl text-[#56070C]">
                    <FiUser size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {reservation?.user?.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {reservation?.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FiClock size={14} /> {reservation?.startTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiUsers size={14} /> {reservation?.peopleCount} personas
                  </span>
                </div>
                {reservation?.table && (
                  <p className="text-sm text-gray-500">
                    Mesa:{" "}
                    <span className="font-medium text-gray-700">
                      #{reservation.table.number || reservation.table.id}
                    </span>
                  </p>
                )}
              </div>

              {/* Platillos */}
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-red-950">
                    Platillos
                  </h2>
                  <span className="text-sm text-gray-500">
                    {entregados} / {pedidos.length} entregados
                  </span>
                </div>

                {pedidos.length === 0 ? (
                  <p className="text-gray-400">No hay platillos en esta orden</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {pedidos.map((p: any) => (
                      <li
                        key={p.id}
                        className={`flex items-center justify-between p-4 rounded-xl border ${
                          p.status === "ENTREGADO"
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {p.status === "ENTREGADO" ? (
                            <FiCheckCircle className="text-green-500" size={20} />
                          ) : (
                            <FiCircle className="text-gray-400" size={20} />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {p.menuItem?.name}
                            </p>
                            <p className="text-sm text-gray-400">x{p.quantity}</p>
                          </div>
                        </div>
                        {p.status !== "ENTREGADO" && (
                          <button
                            onClick={() => handleDeliver(p.id)}
                            className="text-sm py-1 px-3 bg-linear-to-r from-[#7c090c] to-[#520509] text-white rounded-lg hover:opacity-90 transition cursor-pointer"
                          >
                            Entregar
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Agregar platillo extra */}
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-red-950">
                    Agregar platillo extra
                  </h2>
                  <button
                    onClick={() => setShowPlatoSearch(!showPlatoSearch)}
                    className="p-2 bg-[#F6E3D9] text-[#56070C] rounded-xl hover:bg-[#f0d0c0] transition cursor-pointer"
                  >
                    {showPlatoSearch ? <FiX size={20} /> : <FiPlus size={20} />}
                  </button>
                </div>

                {showPlatoSearch && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Buscar platillo..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="border border-gray-300 rounded-xl px-4 py-2 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#56070C]"
                    />

                    {search && (
                      <ul className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        {platosFiltrados.map((p: any) => (
                          <li
                            key={p.id}
                            onClick={() => {
                              setSelectedPlato(p);
                              setSearch(p.name);
                            }}
                            className={`px-4 py-3 cursor-pointer hover:bg-[#F6E3D9] transition ${
                              selectedPlato?.id === p.id ? "bg-[#F6E3D9]" : ""
                            }`}
                          >
                            <span className="font-medium">{p.name}</span>
                            <span className="text-sm text-gray-400 ml-2">
                              ${p.price}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {selectedPlato && (
                      <div className="flex items-center gap-3 mt-2">
                        <label className="text-gray-600 font-medium">Cantidad:</label>
                        <input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="border border-gray-300 rounded-xl px-4 py-2 w-20 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#56070C]"
                        />
                        <button
                          onClick={handleAddPedido}
                          className="py-2 px-6 bg-linear-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-xl shadow hover:opacity-90 transition cursor-pointer"
                        >
                          Agregar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}