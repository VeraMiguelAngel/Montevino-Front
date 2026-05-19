"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import HostSidebar from "@/components/host/HostSidebar";
import { useAuth } from "@/context/AuthContext";
import { getClosedOrders } from "@/services/hostService";
import { FiUser, FiUsers, FiClock } from "react-icons/fi";

export default function HostOrdenesCorradasPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!userData || userData.user.role !== "HOST") {
      router.push("/");
      return;
    }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, userData]);

  const fetchOrders = async () => {
    try {
      const data = await getClosedOrders();
      setOrders(data);
    } catch {
      console.error("Error al cargar órdenes cerradas");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthReady || !userData) return null;

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen mt-20 w-full bg-[#F6E3D9] flex">
        <HostSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 px-6 py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-red-950">
              Mesas cerradas
            </h1>
            <p className="mt-2 text-gray-500">
              Historial de órdenes finalizadas
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500 animate-pulse">Cargando...</p>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow">
              <p className="text-gray-400 text-lg">No hay mesas cerradas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {orders.map((o: any) => {
                const reservation = o.reservation;
                const pedidos = reservation?.pedidos || [];
                const extras = pedidos.filter((p: any) => p.isExtra);
                const prePedidos = pedidos.filter((p: any) => !p.isExtra);

                const totalPrePedidos = prePedidos.reduce(
                  (acc: number, p: any) => acc + Number(p.price) * p.quantity, 0
                );
                const totalExtras = extras.reduce(
                  (acc: number, p: any) => acc + Number(p.price) * p.quantity, 0
                );
                const totalACobrar = totalPrePedidos * 0.85 + totalExtras;

                return (
                  <div
                    key={o.id}
                    className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4"
                  >
                    {/* Cliente */}
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

                    {/* Info */}
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiClock size={14} />{" "}
                        {new Date(o.checkInTime).toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiUsers size={14} /> {reservation?.peopleCount} personas
                      </span>
                    </div>

                    {/* Mesa */}
                    {reservation?.table && (
                      <p className="text-sm text-gray-500">
                        Mesa:{" "}
                        <span className="font-medium text-gray-700">
                          #{reservation.table.number || reservation.table.id}
                        </span>
                      </p>
                    )}

                    {/* Platillos */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Platillos:
                      </p>
                      <ul className="text-sm text-gray-500 space-y-1">
                        {pedidos.map((p: any) => (
                          <li key={p.id} className="flex justify-between">
                            <span>
                              {p.menuItem?.name}
                              {p.isExtra && (
                                <span className="ml-1 text-xs text-[#56070C]">(extra)</span>
                              )}
                            </span>
                            <span>x{p.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-3 flex flex-col gap-1">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Seña pagada:</span>
                        <span>${Number(reservation?.depositAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>85% platos:</span>
                        <span>${(totalPrePedidos * 0.85).toFixed(2)}</span>
                      </div>
                      {totalExtras > 0 && (
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Extras:</span>
                          <span>${totalExtras.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-gray-800 mt-1">
                        <span>Total cobrado:</span>
                        <span>${totalACobrar.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}