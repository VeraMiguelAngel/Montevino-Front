"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import Protected from "@/components/Protected";
import { cancelReservation } from "@/services/reservationsService";
import {
  getCurrentUserWithReservations,
  IReservation,
} from "@/services/usersService";

export default function MisReservasPage() {
  const [reservas, setReservas] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadReservas = async () => {
      try {
        const session = JSON.parse(
          localStorage.getItem("userSession") || "null",
        );
        const token = session?.token;

        if (!token) {
          throw new Error("No hay sesión iniciada");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/myreservations`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "No se pudieron cargar tus reservas");
        }

        setReservas(data || []);
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudieron cargar tus reservas",
          confirmButtonColor: "#7c090c",
        });
      } finally {
        setLoading(false);
      }
    };

    loadReservas();
  }, []);

  const reservasOrdenadas = useMemo(() => {
    return [...reservas].sort((a, b) => {
      const fechaA = new Date(`${a.reservationDate}T${a.startTime}`);
      const fechaB = new Date(`${b.reservationDate}T${b.startTime}`);
      return fechaB.getTime() - fechaA.getTime();
    });
  }, [reservas]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatPrice = (value?: number | string) => {
    const num = Number(value || 0);
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getBadgeClasses = (status: string) => {
    const normalized = status?.toUpperCase();

    if (normalized?.includes("SUCCESS") || normalized?.includes("CONFIRM")) {
      return "bg-green-100 text-green-700";
    }

    if (normalized?.includes("PENDING") || normalized?.includes("PEND")) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (normalized?.includes("FAILURE") || normalized?.includes("CANCEL")) {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const normalized = status?.toUpperCase();

    if (normalized?.includes("CONFIRM") || normalized?.includes("SUCCESS"))
      return "CONFIRMADA";
    if (normalized?.includes("PENDING") || normalized?.includes("PEND"))
      return "PENDIENTE";
    if (normalized?.includes("FAILURE") || normalized?.includes("CANCEL"))
      return "CANCELADA";

    return status || "Sin estado";
  };

  const contarPlatos = (reserva: IReservation) => {
    return (
      reserva.pedidos?.reduce(
        (acc, pedido) => acc + Number(pedido.quantity || 0),
        0,
      ) || 0
    );
  };

  const contarBebidas = (reserva: IReservation) => {
    const bebidas =
      reserva.pedidos?.filter(
        (pedido) => pedido.menuItem?.type?.toLowerCase() === "bebidas",
      ) || [];

    return bebidas.reduce(
      (acc, pedido) => acc + Number(pedido.quantity || 0),
      0,
    );
  };

  const handleCancel = async (reservaId: string, reservationDate: string, startTime: string) => {
  const reservationDateTime = new Date(`${reservationDate}T${startTime}`);
  const now = new Date();
  const diffHours = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) {
    Swal.fire({
      icon: "error",
      title: "No podés cancelar",
      text: "Solo podés cancelar con más de 24hs de anticipación",
      confirmButtonColor: "#7c090c",
    });
    return;
  }

  const result = await Swal.fire({
    title: "¿Cancelar reserva?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#7c090c",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, cancelar",
    cancelButtonText: "Volver",
  });

  if (!result.isConfirmed) return;

  try {
    await cancelReservation(reservaId);
    Swal.fire({
      icon: "success",
      title: "Reserva cancelada",
      timer: 1500,
      showConfirmButton: false,
    });
    setReservas((prev) =>
      prev.map((r) =>
        r.id === reservaId ? { ...r, status: "CANCELADA" } : r
      )
    );
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
      confirmButtonColor: "#7c090c",
    });
  }
};

  return (
    <Protected>
      <section className="mt-10 min-h-screen bg-[#f7efea]">
        <div className="bg-[radial-gradient(circle_at_top,#8b0d14_0%,#5d070b_45%,#3d0407_100%)] md:h-45">
          <div className="px-6 mx-auto max-w-7xl py-14 md:px-8 md:py-16">
            <h1 className="font-serif text-white md:text-4xl">Mis Reservas</h1>
            <p className="max-w-2xl mt-3 text-white/80">
              Acá podés ver el historial de tus reservas y revisar su estado.
            </p>
          </div>
        </div>

        <div className="px-6 py-10 mx-auto max-w-7xl md:px-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[290px] animate-pulse rounded-3xl border border-[#efe1d8] bg-white p-6 shadow-sm"
                />
              ))}
            </div>
          ) : reservasOrdenadas.length === 0 ? (
            <div className="rounded-3xl border border-[#efe1d8] bg-white p-10 text-center shadow-sm">
              <h2 className="font-serif text-3xl text-[#6d1e1e]">
                Todavía no tenés reservas
              </h2>
              <p className="mt-3 text-[#6b5b57]">
                Cuando hagas una reserva, va a aparecer acá.
              </p>

              <Link
                href="/reservar"
                className="mt-6 inline-flex rounded-2xl bg-[#7c090c] px-6 py-3 font-medium text-white transition hover:bg-[#5f0709]"
              >
                Hacer una reserva
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {reservasOrdenadas.map((reserva) => (
                <article
                  key={reserva.id}
                  className="rounded-3xl border border-[#efe1d8] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl text-[#2b1b18]">
                        {formatDate(reserva.reservationDate)} -{" "}
                        {reserva.startTime}
                      </h2>
                      <p className="mt-1 text-sm text-[#8b7b76]">
                        Reserva #{reserva.id.slice(0, 8)}
                      </p>
                    </div>

                    <span
                      className={`rounded-xl px-3 py-2 text-sm font-medium ${getBadgeClasses(
                        reserva.status,
                      )}`}
                    >
                      {getStatusLabel(reserva.status)}
                    </span>
                  </div>

                  <div className="my-5 h-px bg-[#efe1d8]" />

                  <div className="flex flex-wrap items-center gap-10 mt-4 text-lg text-black/90">
                    <p className="flex items-center justify-center">
                      <span>
                        <svg
                          className="mx-2"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="7" r="4" />
                          <path d="M5 21a7 7 0 0 1 14 0" />
                        </svg>
                      </span>
                      <span>{reserva.peopleCount} personas</span>
                    </p>

                    <p className="flex items-center gap-2 text-lg">
                      <span>Platos: {contarPlatos(reserva)}</span>
                    </p>

                    <p className="flex items-center gap-2 text-lg">
                      <span>Bebidas: {contarBebidas(reserva)}</span>
                    </p>

                    {reserva.notes && (
                      <p className="rounded-xl bg-[#fcf6f2] px-3 py-2 text-sm text-[#7a5b52]">
                        <span className="font-medium">Comentario:</span>{" "}
                        {reserva.notes}
                      </p>
                    )}
                  </div>

                  <div className="my-5 h-px bg-[#efe1d8]" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8b7b76]">Total</p>
                      <p className="text-3xl font-semibold text-[#2b1b18]">
                        {formatPrice(reserva.totalPrice)}
                      </p>
                    </div>

                    {String(reserva.status).toUpperCase().includes("PEND") && (
                      <div className="text-right">
                        <p className="text-sm text-[#8b7b76]">Seña</p>
                        <p className="text-lg font-semibold text-[#7c090c]">
                          {formatPrice(reserva.depositAmount)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Link
                      href={`/mis-reservas/${reserva.id}`}
                      className="flex items-center justify-center relative overflow-hidden py-2 w-full bg-gradient-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-md shadow-lg transition duration-300 group cursor-pointer"
                    >
                      Ver detalle
                      <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                    </Link>
                    {String(reserva.status).toUpperCase().includes("CONFIRM") && (
                      <button
                        onClick={() => handleCancel(reserva.id, reserva.reservationDate, reserva.startTime)}
                        className="flex items-center justify-center relative overflow-hidden py-2 w-full bg-white border border-[#7c090c] text-[#7c090c]                    font-semibold rounded-md shadow transition duration-300 cursor-pointer hover:bg-[#fdf2f2]"
                      >
                        Cancelar
                      </button>
                    )}

                    {String(reserva.status).toUpperCase().includes("PEND") && (
                      <Link
                        href={`/pagos?reservationId=${reserva.id}`}
                        className="flex items-center justify-center relative overflow-hidden py-2 w-full bg-gradient-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-md shadow-lg transition duration-300 group cursor-pointer"
                      >
                        Pagar
                        <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Protected>
  );
}
