"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import HostSidebar from "@/components/host/HostSidebar";
import { useAuth } from "@/context/AuthContext";
import { getPendingReservations, cancelReservation } from "@/services/hostService";
import { FiUser, FiUsers, FiClock, FiCalendar, FiXCircle } from "react-icons/fi";
import Swal from "sweetalert2";

export default function ReservasPendientesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!userData || userData.user.role !== "HOST") {
      router.push("/");
      return;
    }
    fetchReservations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, userData]);

  const fetchReservations = async () => {
    try {
      const data = await getPendingReservations();
      setReservations(data);
    } catch {
      console.error("Error al cargar reservas pendientes");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: string) => {
    const result = await Swal.fire({
      title: "¿Cancelar reserva?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#56070C",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
    });

    if (!result.isConfirmed) return;

    try {
      await cancelReservation(reservationId);
      await Swal.fire({
        icon: "success",
        title: "Reserva cancelada",
        timer: 1500,
        showConfirmButton: false,
      });
      setReservations((prev) => prev.filter((r) => r.id !== reservationId));
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cancelar la reserva",
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
            <h1 className="text-4xl font-semibold text-red-950">
              Reservas pendientes
            </h1>
            <p className="mt-2 text-gray-500">
              Reservas sin pago confirmado
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500 animate-pulse">Cargando...</p>
          ) : reservations.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow">
              <p className="text-gray-400 text-lg">
                No hay reservas pendientes
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
                      <FiCalendar size={14} /> {r.reservationDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock size={14} /> {r.startTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers size={14} /> {r.peopleCount} personas
                    </span>
                  </div>

                  {r.pedidos?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Platillos:
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
                    onClick={() => handleCancel(r.id)}
                    className="flex items-center justify-center gap-2 mt-2 py-2 px-4 bg-white border border-[#56070C] text-[#56070C] font-semibold rounded-xl hover:bg-[#fdf2f2] transition cursor-pointer"
                  >
                    <FiXCircle size={18} />
                    Cancelar reserva
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