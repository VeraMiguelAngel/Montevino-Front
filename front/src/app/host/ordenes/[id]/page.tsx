"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/NavBar";
import HostSidebar from "@/components/host/HostSidebar";
import { useAuth } from "@/context/AuthContext";
import { getHostOrder, deliverPedido } from "@/services/hostService";
import { FiUser, FiUsers, FiClock, FiCheckCircle, FiCircle } from "react-icons/fi";
import Swal from "sweetalert2";

export default function HostOrdenPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  if (!isAuthReady || !userData) return null;

  const reservation = order?.reservation;
  const pedidos = reservation?.pedidos || [];
  const entregados = pedidos.filter((p: any) => p.status === "ENTREGADO").length;

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
              <div className="mb-8">
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
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-red-950">
                    Platillos
                  </h2>
                  <span className="text-sm text-gray-500">
                    {entregados} / {pedidos.length} entregados
                  </span>
                </div>

                {pedidos.length === 0 ? (
                  <p className="text-gray-400">No hay platillos en esta reserva</p>
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
                            <p className="text-sm text-gray-400">
                              x{p.quantity}
                            </p>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}