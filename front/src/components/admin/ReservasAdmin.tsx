"use client";
import { IReserva } from "@/types/types";
import { useState } from "react";

type ReservasAdminProps = {
  reservas: IReserva[];
  fechaSeleccionada: string;
  setFechaSeleccionada: (fecha: string) => void;
  fechasUnicas: string[];
};

export default function ReservasAdmin({
  reservas,
  fechaSeleccionada,
  setFechaSeleccionada,
}: ReservasAdminProps) {
  const [reservaDetalle, setReservaDetalle] = useState<IReserva | null>(null);

  const estadoColor = (estado: string) => {
    if (estado === "confirmada") return "bg-green-100 text-green-700";
    if (estado === "pago pendiente") return "bg-orange-100 text-orange-700";
  };

  const reservasFiltradas = reservas.filter(
    (r) => r.reservationDate === fechaSeleccionada,
  );

  return (
    <div className="w-200 h-full p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.20)] bg-white">
      <h2 className="mb-4 text-3xl text-red-950">Reservas</h2>

      <div className="mb-6">
        <label htmlFor="fecha" className="mr-2 font-semibold">
          Fecha:
        </label>
        <input
          type="date"
          id="fecha"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#56070C]"
        />
      </div>

      <table className="w-full table-fixed">
        <thead className="text-sm text-black bg-gray-100">
          <tr>
            <th className="w-1/6 px-3 py-3 text-center">Fecha</th>
            <th className="w-1/6 px-3 py-3 text-center">Hora</th>
            <th className="w-1/6 px-3 py-3 text-center">Nombre</th>
            <th className="w-1/6 px-3 py-3 text-center">Personas</th>
            <th className="w-1/6 px-3 py-3 text-center">Mesa</th>
            <th className="w-1/6 px-3 py-3 text-center">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {reservasFiltradas.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center">
                <h2>No hay reservas para mostrar.</h2>
              </td>
            </tr>
          ) : (
            reservasFiltradas.map((r, i) => (
              <tr
                key={i}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setReservaDetalle(r)} // <-- Agrega esto
              >
                <td className="w-1/6 px-3 py-3 text-center">
                  {r.reservationDate}
                </td>
                <td className="w-1/6 px-3 py-3 text-center">{r.startTime}</td>
                <td className="w-1/6 px-3 py-3 text-center">{r.user.name}</td>
                <td className="w-1/6 px-3 py-3 text-center">{r.peopleCount}</td>
                <td className="w-1/6 px-3 py-3 text-center">
                  {r.table && r.table.tableNumber ? (
                    r.table.tableNumber
                  ) : (
                    <span className="text-gray-500">Sin mesa</span>
                  )}
                </td>
                <td className="w-1/6 px-3 py-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor(
                      r.status.toLowerCase(),
                    )}`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Modal de detalle */}
      {reservaDetalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
          onClick={() => setReservaDetalle(null)}
        >
          <div
            className="w-full max-w-md p-8 mx-4 bg-white shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute text-2xl text-gray-400 top-2 right-3 hover:text-red-600"
              onClick={() => setReservaDetalle(null)}
            >
              &times;
            </button>
            <h3 className="mb-4 text-xl font-bold text-red-950">
              Detalle de Reserva
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Nombre:</span>{" "}
                {reservaDetalle.user.name}
              </div>
              <div>
                <span className="font-semibold">Email:</span>{" "}
                {reservaDetalle.user.email}
              </div>
              <div>
                <span className="font-semibold">Fecha:</span>{" "}
                {reservaDetalle.reservationDate}
              </div>
              <div>
                <span className="font-semibold">Hora:</span>{" "}
                {reservaDetalle.startTime}
              </div>
              <div>
                <span className="font-semibold">Personas:</span>{" "}
                {reservaDetalle.peopleCount}
              </div>
              <div>
                <span className="font-semibold">Mesa:</span>{" "}
                {reservaDetalle.table && reservaDetalle.table.tableNumber
                  ? reservaDetalle.table.tableNumber
                  : "Sin mesa"}
              </div>
              <div>
                <span className="font-semibold">Estado:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor(reservaDetalle.status.toLowerCase())}`}
                >
                  {reservaDetalle.status}
                </span>
              </div>
              {/* Platos pedidos */}
              <div>
                <span className="font-semibold">Platos pedidos:</span>
                <ul className="mt-1 ml-4 list-disc">
                  {Array.isArray(reservaDetalle.pedidos) &&
                  reservaDetalle.pedidos.length > 0 ? (
                    reservaDetalle.pedidos.map((pedido: any, idx: number) => (
                      <li key={pedido.id || idx}>
                        {pedido.name} x {pedido.quantity}{" "}
                        <span className="text-gray-500">
                          (${(pedido.price * pedido.quantity).toFixed(2)})
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No hay platos pedidos.</li>
                  )}
                </ul>
              </div>
              <div>
                <span className="font-semibold">Total:</span>{" "}
                <span>
                  $
                  {Array.isArray(reservaDetalle.pedidos)
                    ? reservaDetalle.pedidos
                        .reduce(
                          (acc: number, pedido: any) =>
                            acc + pedido.price * pedido.quantity,
                          0,
                        )
                        .toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
