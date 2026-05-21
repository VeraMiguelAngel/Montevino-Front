"use client";
import { useEffect, useState } from "react";
import { getTablesStatus } from "@/services/reservationsService";

type Mesa = {
  id: string;
  tableNumber: number;
  status: "DISPONIBLE" | "RESERVADA" | "OCUPADA";
};

const statusConfig = {
  DISPONIBLE: {
    color: "bg-green-100 border-green-400 text-green-800",
    label: "Disponible",
    dot: "bg-green-500",
  },
  RESERVADA: {
    color: "bg-red-100 border-red-400 text-red-800",
    label: "Reservada",
    dot: "bg-red-500",
  },
  OCUPADA: {
    color: "bg-yellow-100 border-yellow-400 text-yellow-800",
    label: "Ocupada",
    dot: "bg-yellow-500",
  },
};

export default function TablasMapa() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMesas();
    // Actualiza cada 30 segundos
    const interval = setInterval(fetchMesas, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMesas = async () => {
    try {
      const data = await getTablesStatus();
      setMesas(data.sort((a: Mesa, b: Mesa) => a.tableNumber - b.tableNumber));
    } catch {
      console.error("Error al cargar mesas");
    } finally {
      setLoading(false);
    }
  };

  const disponibles = mesas.filter((m) => m.status === "DISPONIBLE").length;
  const reservadas = mesas.filter((m) => m.status === "RESERVADA").length;
  const ocupadas = mesas.filter((m) => m.status === "OCUPADA").length;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-red-950">
          Estado de las mesas
        </h2>
        <button
          onClick={fetchMesas}
          className="text-sm text-gray-500 hover:text-red-950 transition cursor-pointer"
        >
          ↻ Actualizar
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <span className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          Disponibles ({disponibles})
        </span>
        <span className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          Reservadas ({reservadas})
        </span>
        <span className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          Ocupadas ({ocupadas})
        </span>
      </div>

      {loading ? (
        <p className="text-gray-400 animate-pulse">Cargando mesas...</p>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {mesas.map((mesa) => {
            const config = statusConfig[mesa.status];
            return (
              <div
                key={mesa.id}
                className={`border-2 rounded-xl p-3 flex flex-col items-center gap-1 ${config.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                <span className="font-bold text-lg">{mesa.tableNumber}</span>
                <span className="text-xs text-center">{config.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}