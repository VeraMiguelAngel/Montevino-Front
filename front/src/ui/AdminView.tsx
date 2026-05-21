"use client";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { getPlatos } from "@/services/platosService";
import { getReservations } from "@/services/reservationsService";
import { getUsers } from "@/services/usersService";
import { useEffect, useState } from "react";
import {
  FiUsers,
  FiShoppingBag,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import Link from "next/link";
import TablasMapa from "@/components/admin/TablasMapa";

const AdminView = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { userData, isAuthReady, checkAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlatos: 0,
    totalReservas: 0,
    totalGanancias: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;

    const init = async () => {
      checkAdmin();
      if (userData?.user.role !== "ADMIN") return;

      try {
        const [users, platos, reservas] = await Promise.all([
          getUsers(),
          getPlatos(1, 1000),
          getReservations(),
        ]);

        const ganancias = Array.isArray(reservas)
          ? reservas.reduce(
              (acc: number, r: any) => acc + Number(r.totalPrice || 0),
              0,
            )
          : 0;

        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalPlatos: Array.isArray(platos) ? platos.length : 0,
          totalReservas: Array.isArray(reservas) ? reservas.length : 0,
          totalGanancias: ganancias,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isAuthReady, userData]);

  if (!isAuthReady || !userData) return null;

  const cards = [
    {
      label: "Usuarios",
      value: stats.totalUsers,
      icon: <FiUsers size={28} />,
      href: "/admin/usuarios",
      color: "from-[#350A06] to-[#56070C]",
    },
    {
      label: "Platos",
      value: stats.totalPlatos,
      icon: <FiShoppingBag size={28} />,
      href: "/admin/platos",
      color: "from-[#6D4C41] to-[#8D6E63]",
    },
    {
      label: "Reservas",
      value: stats.totalReservas,
      icon: <FiCalendar size={28} />,
      href: "/admin/reservas-y-mesas",
      color: "from-[#AD1457] to-[#C62828]",
    },
    {
      label: "Ganancias",
      value: `$${stats.totalGanancias.toFixed(2)}`,
      icon: <FiTrendingUp size={28} />,
      href: "/admin/stats",
      color: "from-[#283593] to-[#0277BD]",
    },
  ];

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen mt-20 w-full bg-[#F6E3D9] flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 px-10 py-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-semibold text-red-950">
              Bienvenido/a, {userData.user.name}
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Aquí tienes un resumen de tu restaurante
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 mb-10 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <Link href={card.href} key={card.label}>
                <div
                  className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-white/80">
                      {card.label}
                    </span>
                    <div className="p-2 bg-white/20 rounded-xl">
                      {card.icon}
                    </div>
                  </div>
                  <div className="text-4xl font-bold">
                    {loading ? (
                      <span className="text-2xl animate-pulse">
                        Cargando...
                      </span>
                    ) : (
                      card.value
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Mapa de mesas */}
            <TablasMapa />

          {/* Accesos rápidos */}
          <div className="bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.10)] p-6">
            <h2 className="mb-6 text-2xl font-semibold text-red-950">
              Accesos Rápidos
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/productos/crear-productos">
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-[#F6E3D9] transition-colors cursor-pointer">
                  <div className="bg-[#F6E3D9] p-3 rounded-xl text-[#56070C]">
                    <FiShoppingBag size={22} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Crear Plato</p>
                    <p className="text-sm text-gray-400">
                      Agrega un nuevo plato al menú
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/reservas-y-mesas">
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-[#F6E3D9] transition-colors cursor-pointer">
                  <div className="bg-[#F6E3D9] p-3 rounded-xl text-[#56070C]">
                    <FiCalendar size={22} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Ver Reservas</p>
                    <p className="text-sm text-gray-400">
                      Gestiona las reservas activas
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/stats">
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-[#F6E3D9] transition-colors cursor-pointer">
                  <div className="bg-[#F6E3D9] p-3 rounded-xl text-[#56070C]">
                    <FiTrendingUp size={22} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Ver Estadísticas
                    </p>
                    <p className="text-sm text-gray-400">
                      Revisa las ganancias del mes
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminView;
