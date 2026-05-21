"use client";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { getPlatosStats } from "@/services/reservationsService";
import { useEffect, useState } from "react";
import { getReservations } from "@/services/reservationsService";
import { IReserva } from "@/types/types";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

export default function Stats() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IReserva[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { checkAdmin, isAuthReady, userData } = useAuth();
  const [platosStats, setPlatosStats] = useState<{ name: string; total: number }[]>([]);

  useEffect(() => {
  if (!isAuthReady || !userData) return;
  const init = async () => {
    checkAdmin();
    if (userData.user.role !== "ADMIN") return;
    try {
      const [reservas, platos] = await Promise.all([
        getReservations(),
        getPlatosStats(),
      ]);
      if (Array.isArray(reservas)) setData(reservas);
      else setData([]);
      if (Array.isArray(platos)) setPlatosStats(platos);
      else setPlatosStats([]);
    } catch (error) {
      console.error(error);
      setData([]);
      setPlatosStats([]);
    } finally {
      setLoading(false);
    }
  };
  init();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthReady, userData]);

  if (!isAuthReady || !userData) return null;

  // Ganancias por mes - Line chart
  const gananciasPorMes: { [mes: string]: number } = {};
  data.forEach((reserva) => {
    const mes = new Date(reserva.reservationDate).toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
    });
    gananciasPorMes[mes] = (gananciasPorMes[mes] || 0) + reserva.totalPrice;
  });

  // Reservas por día - últimos 30 días
const hoy = new Date();
const reservasPorDia: { [dia: string]: number } = {};

for (let i = 29; i >= 0; i--) {
  const fecha = new Date(hoy);
  fecha.setDate(hoy.getDate() - i);
  const key = fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
  reservasPorDia[key] = 0;
}

data.forEach((reserva) => {
  const fecha = new Date(reserva.reservationDate).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
  if (reservasPorDia[fecha] !== undefined) {
    reservasPorDia[fecha]++;
  }
});

  const labels = Object.keys(gananciasPorMes);
  const valores = Object.values(gananciasPorMes);
  const labelsReservas = Object.keys(reservasPorDia);
  const valoresReservas = Object.values(reservasPorDia);

  const colors = [
    "#3E2723",
    "#8D6E63",
    "#C62828",
    "#AD1457",
    "#283593",
    "#0277BD",
    "#00897B",
    "#F9A825",
    "#F57C00",
    "#6D4C41",
  ];

  const chartGanancias = {
  labels: Object.keys(gananciasPorMes),
  datasets: [
    {
      label: "Ganancias ($)",
      data: Object.values(gananciasPorMes),
      borderColor: "#7c090c",
      backgroundColor: "rgba(124, 9, 12, 0.1)",
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#7c090c",
      pointRadius: 5,
    },
  ],
};

  const chartReservas = {
  labels: Object.keys(reservasPorDia),
  datasets: [
    {
      label: "Reservas",
      data: Object.values(reservasPorDia),
      borderColor: "#0277BD",
      backgroundColor: "rgba(2, 119, 189, 0.1)",
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#0277BD",
      pointRadius: 5,
    },
  ],
};

  const optionsGanancias = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Ganancias Mensuales ($)",
        font: { size: 18 },
      },
    },
  };

  const optionsReservas = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Reservas Mensuales",
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1, // Solo números enteros en el eje Y
        },
      },
    },
  };

  // Reservas por estado
const reservasPorEstado = {
  CONFIRMADA: data.filter((r) => r.status === "CONFIRMADA").length,
  CANCELADA: data.filter((r) => r.status === "CANCELADA").length,
  "PAGO PENDIENTE": data.filter((r) => r.status === "PAGO PENDIENTE").length,
  FINALIZADA: data.filter((r) => r.status === "FINALIZADA").length,
};

const chartEstados = {
  labels: Object.keys(reservasPorEstado),
  datasets: [
    {
      data: Object.values(reservasPorEstado),
      backgroundColor: ["#4CAF50", "#F44336", "#FF9800", "#2196F3"],
      borderWidth: 2,
    },
  ],
};

// Platos más pedidos
const chartPlatos = {
  labels: platosStats.map((p) => p.name),
  datasets: [
    {
      label: "Cantidad pedida",
      data: platosStats.map((p) => p.total),
      backgroundColor: colors.slice(0, platosStats.length),
      borderRadius: 8,
      borderWidth: 2,
    },
  ],
};

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="h-full mt-20 w-full bg-[#F6E3D9] flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-col items-center justify-center flex-1 mx-10 mb-10">
          <h2 className="pt-10 mb-10 text-5xl text-center text-red-950">
            Gráficos y Estadísticas
          </h2>

          {loading ? (
            <p className="text-xl text-center text-gray-500">
              Cargando datos...
            </p>
          ) : (
            <div className="flex flex-col gap-6 ml-21">
              {/* Gráfico de ganancias */}
<div className="p-6 w-300 h-150 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.20)] bg-white">
  <Line data={chartGanancias} options={optionsGanancias} />
</div>

{/* Gráfico de reservas */}
<div className="p-6 w-300 h-150 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.20)] bg-white">
  <Line data={chartReservas} options={{
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Reservas últimos 30 días", font: { size: 18 } },
    },
    scales: {
      y: {
        ticks: { stepSize: 1 },
        beginAtZero: true,
      },
    },
  }} />
</div>
              {/* Gráfico de reservas por estado */}
<div className="p-6 w-300 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.20)] bg-white flex flex-col items-center">
  <h3 className="text-xl font-semibold text-red-950 mb-4">Reservas por estado</h3>
  <div className="w-80 h-80">
    <Pie data={chartEstados} options={{ plugins: { legend: { position: "bottom" } } }} />
  </div>
</div>

{/* Gráfico de platos más pedidos */}
<div className="p-6 w-300 h-150 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.20)] bg-white">
  <Bar
    data={chartPlatos}
    options={{
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Top 10 platos más pedidos", font: { size: 18 } },
      },
    }}
  />
</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
