"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Protected from "@/components/Protected";
import { useRouter } from "next/navigation";
import { cancelReservation } from "@/services/reservationsService";
import Swal from "sweetalert2";

export default function ReservaDetallePage() {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState<any>(null);

  useEffect(() => {
    const cargarReserva = async () => {
      try {
        const sessionRaw = localStorage.getItem("userSession");
        const session = sessionRaw ? JSON.parse(sessionRaw) : null;
        const token = session?.token;

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
          throw new Error(data.message || "No se pudo obtener la reserva");
        }

        const reservaAMostrar = data.find((item: any) => item.id === id);

        setReserva(reservaAMostrar);
      } catch (error) {
        console.error("Error cargando reserva:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) cargarReserva();
  }, [id]);

  if (!reserva) {
    return <p className="p-6">No se encontró la reserva.</p>;
  }

  return (
    <Protected>
      <section className="min-h-screen bg-[#f7efea]">
        <div className="bg-[radial-gradient(circle_at_top,#8b0d14_0%,#5d070b_45%,#3d0407_100%)]">
          <div className="max-w-5xl px-6 mx-auto py-14 md:px-8 md:py-16">
            <Link
              href="/mis-reservas"
              className="text-white/80 hover:text-white"
            >
              ← Volver a mis reservas
            </Link>

            <h1 className="mt-4 font-serif text-4xl text-white md:text-5xl">
              Detalle de tu reserva
            </h1>

            <p className="mt-3 text-white/80">
              Revisá la información completa de tu reserva.
            </p>
          </div>
        </div>

        <div className="max-w-5xl px-6 py-10 mx-auto md:px-8">
          <div className="rounded-3xl border border-[#efe1d8] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h2 className="font-serif text-3xl text-[#2b1b18]">
                  {reserva.reservationDate}
                </h2>
                <p className="mt-2 text-lg text-[#7a5b52]">
                  {reserva.startTime} hs · {reserva.peopleCount} personas
                </p>
                <p className="mt-1 text-sm text-[#8b7b76]">
                  Reserva #{reserva.id}
                </p>
              </div>

              <span
                className={`w-fit rounded-xl px-4 py-2 text-sm font-medium ${
                  reserva.status
                }`}
              >
                {reserva.status}
              </span>
            </div>

            <div className="my-6 h-px bg-[#efe1d8]" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-[#efe1d8] bg-[#fffaf7] p-5">
                <h3 className="font-serif text-2xl text-[#6d1e1e]">Resumen</h3>

                <div className="flex flex-wrap items-center gap-10 mt-4 text-lg text-black/90">
                  <p className="flex items-center justify-center ">
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
                    </svg>{" "}
                    {reserva.peopleCount} personas
                  </p>
                  <p className="flex items-center justify-center ">
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
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 15" />
                    </svg>{" "}
                    {reserva.startTime} hs
                  </p>
                  <p className="flex items-center justify-center ">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M12 3v18" />
                      <path d="M17 7c0-2-2-3-5-3s-5 1-5 3 2 3 5 3 5 1 5 3-2 3-5 3-5-1-5-3" />
                    </svg>{" "}
                    Total: {reserva.totalPrice}
                  </p>
                  <p className="flex items-center justify-center ">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-gray-600"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                      <path d="M6 15h4" />
                    </svg>{" "}
                    Seña: {reserva.depositAmount}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#efe1d8] bg-[#fffaf7] p-5">
                <h3 className="font-serif text-2xl text-[#6d1e1e]">
                  Comentarios
                </h3>

                <p className="mt-4 text-[#4f2b2b]">
                  {reserva.notes || "Sin comentarios"}
                </p>
              </div>
            </div>

            <div className="my-6 h-px bg-[#efe1d8]" />

            <div>
              <h3 className="font-serif text-3xl text-[#6d1e1e]">Pedidos</h3>

              <div className="mt-5 space-y-4">
                {reserva.pedidos.map((pedido: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl border border-[#efe1d8] p-4"
                  >
                    <div>
                      <p className="text-lg font-medium text-[#2b1b18]">
                        {pedido.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-[#8b7b76]">
                        Cantidad: {pedido.quantity}
                      </p>
                      <p className="text-lg font-semibold text-[#2b1b18]">
                        ${pedido.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8 sm:flex-row">
  <Link
    href="/mis-reservas"
    className="rounded-2xl border border-[#ead8cf] px-5 py-3 text-center font-medium text-[#6d1e1e]"
  >
    Volver
  </Link>

  {String(reserva.status).toUpperCase().includes("PEND") && (
    <Link
      href={`/pagos?reservationId=${reserva.id}`}
      className="rounded-2xl bg-[#7c090c] px-5 py-3 text-center font-medium text-white hover:bg-[#5f0709]"
    >
      Pagar ahora
    </Link>
  )}

  {(String(reserva.status).toUpperCase().includes("CONFIRM") ||
  String(reserva.status).toUpperCase().includes("PEND")) && (
    <button
      onClick={async () => {
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
          await cancelReservation(reserva.id);
          Swal.fire({
            icon: "success",
            title: "Reserva cancelada",
            timer: 1500,
            showConfirmButton: false,
          });
          router.push("/mis-reservas");
        } catch (error: any) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            confirmButtonColor: "#7c090c",
          });
        }
      }}
      className="rounded-2xl border-2 border-[#7c090c] px-5 py-3 text-center font-medium text-[#7c090c] hover:bg-[#fdf2f2] transition cursor-pointer"
    >
      Cancelar reserva
    </button>
  )}
</div>
          </div>
        </div>
      </section>
    </Protected>
  );
}
