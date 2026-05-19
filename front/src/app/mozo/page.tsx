"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import MozoSidebar from "@/components/mozo/MozoSidebar";
import { useAuth } from "@/context/AuthContext";
import { getActiveOrders } from "@/services/mozoService";
import { FiClipboard } from "react-icons/fi";
import Link from "next/link";

export default function MozoDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const { userData, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!userData || userData.user.role !== "MOZO") {
      router.push("/");
      return;
    }
    fetchCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, userData]);

  const fetchCount = async () => {
    try {
      const data = await getActiveOrders();
      setActiveOrdersCount(data.length);
    } catch {
      console.error("Error al cargar órdenes");
    }
  };

  if (!isAuthReady || !userData) return null;

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen mt-20 w-full bg-[#F6E3D9] flex">
        <MozoSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 px-10 py-10">
          <div className="mb-10">
            <h1 className="text-5xl font-semibold text-red-950">
              Bienvenido/a, {userData.user.name}
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Panel de gestión de mesas
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <Link href="/mozo/ordenes">
              <div className="bg-linear-to-br from-[#350A06] to-[#56070C] text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-white/80">
                    Órdenes activas
                  </span>
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FiClipboard size={28} />
                  </div>
                </div>
                <div className="text-4xl font-bold">{activeOrdersCount}</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}