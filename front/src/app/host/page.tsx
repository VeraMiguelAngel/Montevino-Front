"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import HostSidebar from "@/components/host/HostSidebar";
import { useAuth } from "@/context/AuthContext";
import { FiCalendar } from "react-icons/fi";
import Link from "next/link";
import TablasMapa from "@/components/admin/TablasMapa";

export default function HostPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { userData, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!userData || userData.user.role !== "HOST") {
      router.push("/");
    }
  }, [isAuthReady, userData]);

  if (!isAuthReady || !userData) return null;

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen mt-20 w-full bg-[#F6E3D9] flex">
        <HostSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 px-10 py-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-semibold text-red-950">
              Bienvenido/a, {userData.user.name}
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Panel de gestión de reservas
            </p>
          </div>

          {/* Card */}
          <div className="grid grid-cols-1 gap-6 mb-10 sm:grid-cols-2 xl:grid-cols-3">
            <Link href="/host/reservas">
              <div className="bg-gradient-to-br from-[#350A06] to-[#56070C] text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-white/80">
                    Reservas de hoy
                  </span>
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FiCalendar size={28} />
                  </div>
                </div>
                <p className="text-white/70 text-sm">
                  Ver y gestionar las reservas del día
                </p>
              </div>
            </Link>
          </div>

          {/* Mapa de mesas */}
          <TablasMapa />
        </div>
      </div>
    </>
  );
}