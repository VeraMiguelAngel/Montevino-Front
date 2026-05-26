"use client";
import GestionMesas from "@/components/admin/GestionDeMesas";
import ReservasAdmin from "@/components/admin/ReservasAdmin";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { getReservations } from "@/services/reservationsService";
import { IReserva } from "@/types/types";
import { useEffect, useState } from "react";

const ReservasYMesasView = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [reservas, setReservas] = useState<IReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const { checkAdmin, isAuthReady, userData } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthReady || !userData) return;
    const init = async () => {
      checkAdmin();
      if (userData.user.role !== "ADMIN") return;
      try {
        const reservas = await getReservations();
        if (Array.isArray(reservas)) {
          setReservas(reservas);
        } else {
          setReservas([]);
        }
      } catch (error) {
        console.error(error);
        setReservas([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isAuthReady, userData, checkAdmin]);

  if (!isAuthReady || !userData) return null;

  const fechasUnicas = Array.from(
    new Set(reservas.map((r) => r.reservationDate)),
  );

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="h-full mt-20 w-full bg-[#F6E3D9] flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main content */}
        <div className="flex-1">
          <h1 className="pt-10 mb-10 text-5xl text-center text-red-950">
            Administración de Reservas
          </h1>
          <div className="flex justify-center gap-5">
            {/* Lado izquierdo */}
            <div className="mb-5">
              <ReservasAdmin
                reservas={reservas}
                fechaSeleccionada={fechaSeleccionada}
                setFechaSeleccionada={setFechaSeleccionada}
                fechasUnicas={fechasUnicas}
              />
            </div>

            {/* Lado derecho */}
            <div className="mb-5">
              <GestionMesas fechaSeleccionada={fechaSeleccionada} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservasYMesasView;
