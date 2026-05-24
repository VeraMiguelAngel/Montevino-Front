"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import MozoSidebar from "@/components/mozo/MozoSidebar";
import { useAuth } from "@/context/AuthContext";
import { getActiveOrders } from "@/services/mozoService";
import { FiUser, FiUsers, FiClock } from "react-icons/fi";

export default function MozoOrdenesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!userData || userData.user.role !== "MOZO") {
      router.push("/");
      return;
    }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, userData]);

  const fetchOrders = async () => {
    try {
      const data = await getActiveOrders();
      setOrders(data);
    } catch {
      console.error("Error al cargar órdenes");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthReady || !userData) return null;

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen mt-20 w-full bg-[#F6E3D9] flex">
        <MozoSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 px-6 py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-red-950">
              Órdenes activas
            </h1>
            <p className="mt-2 text-gray-500">Mesas en atención</p>
          </div>

          {loading ? (
            <p className="text-gray-500 animate-pulse">Cargando órdenes...</p>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow">
              <p className="text-gray-400 text-lg">No hay órdenes activas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {orders.map((o: any) => {
                const reservation = o.reservation;
                const pedidos = reservation?.pedidos || [];
                const entregados = pedidos.filter(
                  (p: any) => p.status === "ENTREGADO"
                ).length;

                return (
                  <div
                    key={o.id}
                    onClick={() => router.push(`/mozo/ordenes/${o.id}`)}
                    className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 cursor-pointer hover:scale-105 transition-transform duration-300"
                  >
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

                    <div className="flex gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FiClock size={14} />{" "}
                        {new Date(o.checkInTime).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiUsers size={14} /> {reservation?.peopleCount} personas
                      </span>
                    </div>

                    {reservation?.table && (
                      <p className="text-sm text-gray-500">
                        Mesa:{" "}
                        <span className="font-medium text-gray-700">
                          #{reservation.table.tableNumber || reservation.table.id}
                        </span>
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Platillos: {entregados}/{pedidos.length} entregados
                      </span>
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