"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import Protected from "@/components/Protected";
import { useReservation } from "@/context/ReservationContext";

type ProductItem = {
  id: string;
  name: string;
  price: number | string;
  type?: string;
  imageUrl?: string;
  quantity: number;
};

const BACKURL = process.env.NEXT_PUBLIC_API_URL;

export default function PagoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationIdFromUrl = searchParams.get("reservationId");

  const { reservationData, clearReservationData } = useReservation();

  const [cart, setCart] = useState<ProductItem[]>([]);
  const [comentarios, setComentarios] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "tarjeta">(
    "mercadopago",
  );
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado para reserva cargada desde URL
  const [reservaFromUrl, setReservaFromUrl] = useState<any>(null);
  const [loadingReserva, setLoadingReserva] = useState(false);
  useEffect(() => {
    if (!reservationIdFromUrl) return;

    const loadReserva = async () => {
      setLoadingReserva(true);
      try {
        const session = JSON.parse(
          localStorage.getItem("userSession") ?? "null",
        );
        const token = session?.token;

        const res = await fetch(`${BACKURL}/reservations/myreservations`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        const reservaEncontrada = data.find(
          (reserva: any) => reserva.id === reservationIdFromUrl,
        );

        if (!res.ok)
          throw new Error(data.message || "Error al cargar la reserva");

        setReservaFromUrl(reservaEncontrada);

        if (reservaEncontrada.pedidos?.length) {
          const cartFromReserva: ProductItem[] = reservaEncontrada.pedidos.map(
            (pedido: any) => ({
              name: pedido.name || "Producto",
              price: pedido.price || 0,
              quantity: pedido.quantity || 1,
            }),
          );
          setCart(cartFromReserva);
        }

        if (reservaEncontrada.notes) setComentarios(reservaEncontrada.notes);
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo cargar la reserva",
        });
      } finally {
        setLoadingReserva(false);
      }
    };

    loadReserva();
  }, [reservationIdFromUrl]);

  // Si NO viene de URL, cargar del localStorage (flujo normal)
  useEffect(() => {
    if (reservationIdFromUrl) return; // ya lo maneja el useEffect de arriba

    const savedCart = localStorage.getItem("montevino_reserva_cart");
    const savedComentarios = localStorage.getItem(
      "montevino_reserva_comentarios",
    );
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedComentarios) setComentarios(savedComentarios);
  }, [reservationIdFromUrl]);

  // Datos de la reserva: usa los del backend si vinieron por URL, sino del context
  const reservationDate =
    reservaFromUrl?.reservationDate || reservationData.reservationDate;
  const startTime = reservaFromUrl?.startTime || reservationData.startTime;
  const peopleCount =
    reservaFromUrl?.peopleCount || reservationData.peopleCount;
  const reservationId = reservationIdFromUrl || reservationData.reservationId;

  const platos = useMemo(() => {
    return cart.filter((item) => item.type?.toLowerCase() === "platos");
  }, [cart]);

  const bebidas = useMemo(() => {
    return cart.filter((item) => item.type?.toLowerCase() === "bebidas");
  }, [cart]);

  const subtotalPlatos = useMemo(() => {
    return platos.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0,
    );
  }, [platos]);

  const subtotalBebidas = useMemo(() => {
    return bebidas.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0,
    );
  }, [bebidas]);

  const totalGeneral = subtotalPlatos + subtotalBebidas;
  const costoMesaPorPersona = 2000;
  const totalMesa = peopleCount * costoMesaPorPersona;
  const señaComida = Math.round(totalGeneral * 0.15);
  const señaTotal = Math.round(señaComida + totalMesa);
  const totalFinal = Math.round(totalGeneral + totalMesa);
  const restoRestaurante = Math.round(totalFinal - señaTotal);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);

  const formatReservationDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const validarReserva = () => {
    if (!reservationDate || !startTime || !peopleCount) {
      Swal.fire({
        icon: "warning",
        title: "Faltan datos de la reserva",
        text: "Primero debés elegir fecha, hora y cantidad de personas.",
      });
      return false;
    }

    return true;
  };

  const limpiarReservaLocal = () => {
    localStorage.removeItem("montevino_reserva_cart");
    localStorage.removeItem("montevino_reserva_comentarios");
    setCart([]);
    setComentarios("");
    clearReservationData();
  };

  const validarDatosReserva = () => {
    if (!reservationDate || !startTime || !peopleCount) {
      Swal.fire({
        icon: "warning",
        title: "Faltan datos de la reserva",
        text: "No se pudieron cargar los datos de la reserva.",
      });
      return false;
    }
    return true;
  };

  const handleMercadoPagoReal = async () => {
    if (!validarDatosReserva()) return;

    // ✅ Validar que el ID existe ANTES de hacer el fetch
    if (!reservationId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el ID de la reserva. Por favor volvé a intentarlo.",
      });
      return;
    }

    console.log("Pagando reserva con ID:", reservationId); // debug

    setLoading(true);

    try {
      if (!BACKURL) throw new Error("Falta configurar NEXT_PUBLIC_BACKURL");

      const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
      const token = session?.token;

      // ✅ Ahora usa el ID correcto ya sea de URL o del context
      if (!reservationId) throw new Error("No se encontró el ID de la reserva");

      const pagoRes = await fetch(`${BACKURL}/payments/${reservationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const pagoData = await pagoRes.json();

      if (!pagoRes.ok) {
        throw new Error(
          pagoData.message || "No se pudo crear la preferencia de pago",
        );
      }

      const initPoint =
        pagoData.init_point ||
        pagoData.sandbox_init_point ||
        pagoData.url ||
        pagoData.checkoutUrl ||
        pagoData.checkout_url ||
        pagoData.paymentUrl ||
        pagoData.payment_url ||
        pagoData.data?.init_point ||
        pagoData.data?.url;

      if (!initPoint) {
        throw new Error(
          `Mercado Pago no devolvió una URL de pago. Keys disponibles: ${Object.keys(pagoData).join(", ")}`,
        );
      }

      window.location.href = initPoint;
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async () => {
    await handleMercadoPagoReal();
    return;
  };

  if (loadingReserva) {
    return (
      <Protected>
        <div className="min-h-screen bg-[#f7efea] flex items-center justify-center">
          <p className="text-[#6d1e1e] text-xl">Cargando reserva...</p>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <section className="mt-10 min-h-screen bg-[#f7efea]">
        <div className="bg-[radial-gradient(circle_at_top,#8b0d14_0%,#5d070b_45%,#3d0407_100%)]">
          <div className="px-6 mx-auto max-w-7xl py-14 md:px-8 md:py-16">
            <h1 className="font-serif text-4xl text-white md:text-4xl">
              Confirmar tu reserva
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-lg text-white/90">
              <span className="flex items-center justify-center ">
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>{" "}
                {formatReservationDate(reservationDate)}
              </span>

              <span className="flex items-center justify-center ">
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
                  {/* ❌ ANTES: {startTime} hs estaba acá dentro del SVG */}
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15 15" />
                </svg>
                {startTime} hs
              </span>

              <span className="flex items-center justify-center ">
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
                  {/* ❌ ANTES: {peopleCount} personas estaba acá dentro del SVG */}
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5 21a7 7 0 0 1 14 0" />
                </svg>{" "}
                {peopleCount} personas
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[#e5cfc5] bg-[#fffaf7] p-6 shadow-sm md:p-8">
            <h2 className="font-serif text-3xl text-[#6d1e1e]">
              METODO DE PAGO
            </h2>

            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("mercadopago")}
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  paymentMethod === "mercadopago"
                    ? "border-[#8b1e2d] bg-[#f8ece6]"
                    : "border-[#e5cfc5] bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-6 w-6 rounded-full border-2 ${
                      paymentMethod === "mercadopago"
                        ? "border-[#8b1e2d] bg-[#8b1e2d]"
                        : "border-[#c9b1a7]"
                    }`}
                  />
                  <span className="text-xl font-serif text-[#6d1e1e]">
                    Mercado Pago
                  </span>
                </div>
              </button>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => router.back()}
                className="w-full relative overflow-hidden rounded-2xl border-2 border-[#7c090c] py-3 text-xl font-semibold text-[#7c090c] shadow-lg transition duration-300 group cursor-pointer"
              >
                <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                ← Volver
              </button>

              <button
                onClick={handlePagar}
                disabled={loading}
                className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7c090c] to-[#520509] py-3 text-xl font-semibold text-white shadow-lg transition duration-300 group cursor-pointer"
              >
                <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                {loading ? "Procesando..." : `Pagar seña $${formatPrice(señaTotal)}`}
              </button>
            </div>
            {/* Avisos importantes */}
                <div className="rounded-2xl border border-[#e5cfc5] bg-[#fff8f5] p-5 space-y-3 mt-6">
                  <h3 className="font-serif text-lg text-[#6d1e1e] font-semibold">
                    ⚠️ Información importante
                  </h3>
                  <ul className="space-y-2 text-sm text-[#5c2c2c]">
                    <li className="flex gap-2">
                      <span>⏰</span>
                                      <span>Podés llegar hasta <strong>15 minutos antes</strong> de tu reserva. Tenemos una tolerancia de <strong>30 minutos de retraso</strong>, pasado ese tiempo la mesa puede ser reasignada.</span>
                    </li>
                    <li className="flex gap-2">
                      <span>💸</span>
                      <span>La seña <strong>no es reembolsable</strong> en caso de cancelación con menos de 24hs de anticipación o si no se presenta al turno reservado.</span>
                    </li>
                    <li className="flex gap-2">
                      <span>📅</span>
                      <span>Podés cancelar tu reserva <strong>hasta 24hs antes</strong> desde la sección &quot;Mis Reservas&quot;.</span>
                    </li>
                  </ul>
                </div>

          </div>

          <div className="rounded-3xl border border-[#e5cfc5] bg-[#fffaf7] p-6 shadow-sm md:p-8">
            <h2 className="font-serif text-4xl text-[#6d1e1e]">TU RESERVA</h2>

            <div className="mt-6 space-y-4 w-full grid items-stretch justify-start text-[#5c2c2c] text-lg">
              <span className="flex items-center w-full gap-2 mt-6 space-y-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>{" "}
                {formatReservationDate(reservationDate)}
              </span>

              <span className="flex items-center w-full gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* ❌ ANTES: {startTime} hs estaba acá dentro del SVG */}
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15 15" />
                </svg>
                {startTime} hs
              </span>

              <span className="flex items-center w-full gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* ❌ ANTES: {peopleCount} personas estaba acá dentro del SVG */}
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5 21a7 7 0 0 1 14 0" />
                </svg>{" "}
                {peopleCount} personas
              </span>
            </div>

            <div className="my-6 h-px bg-[#e3c8bf]" />

            <h3 className="font-serif text-3xl text-[#6d1e1e]">Productos</h3>
            <div className="mt-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-[#7b6761]">No agregaste productos.</p>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={item.id || index} // <-- index como fallback si id es undefined
                    className="flex justify-between gap-4 text-lg"
                  >
                    <p className="text-[#4f2b2b]">
                      {item.name}
                      <span className="ml-2 text-[#8c6a61]">
                        x{item.quantity}
                      </span>
                    </p>
                    <p className="font-semibold text-[#4f2b2b]">
                      ${formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {comentarios && (
              <>
                <div className="my-6 h-px bg-[#e3c8bf]" />
                <div>
                  <h3 className="font-serif text-2xl text-[#6d1e1e]">
                    Comentarios
                  </h3>
                  <p className="mt-2 text-[#5e4a45]">{comentarios}</p>
                </div>
              </>
            )}

            <div className="my-6 h-px bg-[#e3c8bf]" />

            <div className="space-y-4 text-lg">
              <div className="flex items-center justify-between">
                <p className="text-[#5c2c2c]">Subtotal platos</p>
                <p className="font-semibold text-[#4f2b2b]">
                  ${formatPrice(subtotalPlatos)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[#5c2c2c]">Subtotal bebidas</p>
                <p className="font-semibold text-[#4f2b2b]">
                  ${formatPrice(subtotalBebidas)}
                </p>
              </div>

              <div className="h-px bg-[#e3c8bf]" />

              <div className="flex items-center justify-between">
                <p className="text-[#5c2c2c]">Reserva del menú(15%)</p>
                <p className="font-semibold text-[#4f2b2b]">
                  {formatPrice(señaComida)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[#5c2c2c]">
                  Reserva de mesa (${costoMesaPorPersona} x {peopleCount})
                </p>
                <p className="font-semibold text-[#4f2b2b]">
                  {formatPrice(totalMesa)}
                </p>
              </div>

              <div className="h-px bg-[#e3c8bf]" />

              <div className="flex items-center justify-between text-2xl">
                <p className="font-semibold text-[#5c2c2c]">Total General</p>
                <p className="font-bold text-[#5c0f14]">
                  ${formatPrice(totalFinal)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e5cfc5] bg-[#f8ece6] p-5">
                <div className="flex items-center justify-between text-2xl">
                  <p className="text-[#5c2c2c]">Seña a pagar ahora</p>
                  <p className="font-bold text-[#7c090c]">
                    ${formatPrice(señaTotal)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xl font-semibold">
                <p className="text-[#5c2c2c]">Resto en el restaurante</p>
                <p className="text-[#4f2b2b]">
                  ${formatPrice(restoRestaurante)}
                </p>                
              </div>
            </div>
          </div>
        </div>
      </section>
    </Protected>
  );
}
