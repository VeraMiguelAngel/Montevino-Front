"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import HostSidebar from "@/components/host/HostSidebar";
import { useAuth } from "@/context/AuthContext";
import { getReservationsByDate, checkIn } from "@/services/hostService";
import { FiUser, FiUsers, FiClock, FiCheckCircle } from "react-icons/fi";
import Swal from "sweetalert2";

interface User {
  id: string;
  name: string;
  email: string;
}

interface MenuItem {
  id: string;
  name: string;
}

interface Pedido {
  id: string;
  menuItem?: MenuItem;
  quantity: number;
}

interface Table {
  id: string | number;
  number?: string | number;
}

interface Reservation {
  id: string;
  user?: User;
  startTime?: string;
  peopleCount?: number;
  table?: Table | null;
  pedidos?: Pedido[];
}

export default function HostReservasPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const { userData, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!userData || userData.user.role !== "HOST") {
      router.push("/");
      return;
    }
    fetchReservations(selectedDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, userData, selectedDate]);

  const fetchReservations = async (date: string) => {
    setLoading(true);
    try {
      const data = await getReservationsByDate(date);
      setReservations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (reservationId: string) => {
    try {
      const result = await Swal.fire({
        title: "¿Confirmar llegada?",
        text: "Se generará una orden para esta mesa",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#56070C",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      const order = await checkIn(reservationId);

      await Swal.fire({
        icon: "success",
        title: "Check-in exitoso",
        text: "La orden fue generada correctamente",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push(`/host/ordenes/${order.hostOrderId}`);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo realizar el check-in",
        confirmButtonColor: "#56070C",
      });
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
            <h1 className="text-4xl font-semibold text-red-950">Reservas</h1>
            <div className="mt-4 flex items-center gap-3">
              <label className="text-gray-600 font-medium">Fecha:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#56070C]"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500 animate-pulse">Cargando reservas...</p>
          ) : reservations.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow">
              <p className="text-gray-400 text-lg">
                No hay reservas confirmadas para esta fecha
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reservations.map((r: any) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#F6E3D9] p-2 rounded-xl text-[#56070C]">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {r.user?.name}
                      </p>
                      <p className="text-sm text-gray-400">{r.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FiClock size={14} /> {r.startTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers size={14} /> {r.peopleCount} personas
                    </span>
                  </div>

                  {r.table && (
                    <p className="text-sm text-gray-500">
                      Mesa:{" "}
                      <span className="font-medium text-gray-700">
                        #{r.table.tableNumber || r.table.id}
                      </span>
                    </p>
                  )}

                  {r.pedidos?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Platillos reservados:
                      </p>
                      <ul className="text-sm text-gray-500 space-y-1">
                        {r.pedidos.map((p: any) => (
                          <li key={p.id} className="flex justify-between">
                            <span>{p.menuItem?.name}</span>
                            <span>x{p.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => handleCheckIn(r.id)}
                    className="flex items-center justify-center gap-2 mt-2 py-2 px-4 bg-linear-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-xl shadow hover:opacity-90 transition cursor-pointer"
                  >
                    <FiCheckCircle size={18} />
                    Check-in
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}