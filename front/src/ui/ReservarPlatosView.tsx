"use client";

import { useEffect, useMemo, useState } from "react";
import { IProduct } from "@/types/types";
import Protected from "@/components/Protected";
import Swal from "sweetalert2";
import Link from "next/link";
import { getPlatos } from "@/services/platosService";
import { getBebidas } from "@/services/bebidasService";
import { useRouter, useSearchParams } from "next/navigation";
import { useReservation } from "@/context/ReservationContext";
import { useAuth } from "@/context/AuthContext";

type CartItem = IProduct & {
  quantity: number;
};

export default function ReservarPlatosView() {
  const [activeTab, setActiveTab] = useState<"platos" | "bebidas">("platos");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [comentarios, setComentarios] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [categoryFilter, setCategoryFilter] = useState<string>("todos");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setReservationData } = useReservation();

  const searchParams = useSearchParams();

  const { userData, isAuthReady } = useAuth();

useEffect(() => {
  if (!isAuthReady) return;
  if (userData?.user?.role === "ADMIN" ||
      userData?.user?.role === "HOST" ||
      userData?.user?.role === "MOZO") {
    router.push("/");
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthReady, userData]);

  const reservationDate = searchParams.get("fecha");
  const startTime = searchParams.get("hora") || "";
  const peopleCount = Number(searchParams.get("personas")) || 1;

  useEffect(() => {
    const savedCart = localStorage.getItem("montevino_reserva_cart");
    const savedComentarios = localStorage.getItem(
      "montevino_reserva_comentarios",
    );

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    if (savedComentarios) {
      setComentarios(savedComentarios);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("montevino_reserva_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("montevino_reserva_comentarios", comentarios);
  }, [comentarios]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [platosData, bebidasData] = await Promise.all([
          getPlatos(1, 100),
          getBebidas(1, 100),
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bebidasAdaptadas = bebidasData.map((bebida: any) => ({
          ...bebida,
          type: "bebidas",
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const platosAdaptados = platosData.map((plato: any) => ({
          ...plato,
          type: "platos",
        }));
        
        setProducts([...platosAdaptados, ...bebidasAdaptadas]);
      } catch (error) {
        console.error("Error al traer productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  
  const platos = useMemo(() => {
    return products.filter((item) => item.type?.toLowerCase() === "platos");
  }, [products]);

  const bebidas = useMemo(() => {
    return products.filter((item) => item.type?.toLowerCase() === "bebidas");
  }, [products]);
  useEffect(() => {
    console.log("PLATOS:", platos);
    console.log("BEBIDAS:", bebidas);
  }, [platos, bebidas]);

  const totalPages = Math.ceil(platos.length / itemsPerPage);

  const platosPaginados = platos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const visibleItems = activeTab === "platos" ? platosPaginados : bebidas;

  const categoryOptions =
    activeTab === "platos"
      ? [
          "todos",
          "carne",
          "pescado",
          "mariscos",
          "parrilla",
          "vegetariano",
          "sin tac",
        ]
      : [
          "todos",
          "vinos",
          "cervezas",
          "cocktails",
          "jugos",
          "agua",
          "gaseosas",
        ];

  const filteredItems = useMemo(() => {
    const visibleItems = activeTab === "platos" ? platosPaginados : bebidas;

    if (categoryFilter === "todos") return visibleItems;

    return visibleItems.filter(
      (item) =>
        item.category?.name?.toLowerCase() === categoryFilter.toLowerCase(),
    );
  }, [activeTab, platosPaginados, bebidas, categoryFilter]);

  const getQuantity = (id: string) => quantities[id] ?? 1;

  const disminuirCantidad = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] ?? 1) - 1),
    }));
  };

  const aumentarCantidad = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 1) + 1,
    }));
  };

  const agregarAlCarrito = (item: IProduct) => {
    // Verificar stock
    if (item.stock === 0) {
      Swal.fire({
        icon: "error",
        title: "Sin stock",
        text: `${item.name} no tiene stock disponible`,
        confirmButtonColor: "#7c090c",
      });
      return;
    }

    const quantity = quantities[item.id] ?? 1;

    // Verificar que la cantidad no supere el stock
    const cantidadEnCarrito = cart.find((c) => c.id === item.id)?.quantity ?? 0;
    if (cantidadEnCarrito + quantity > item.stock) {
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${item.stock} unidades disponibles de ${item.name}`,
        confirmButtonColor: "#7c090c",
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem,
        );
      }
      return [...prev, { ...item, quantity }];
    });

    setQuantities((prev) => ({
      ...prev,
      [item.id]: 1,
    }));
  };

  const eliminarTodoDelCarrito = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const eliminarDelCarrito = (id: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const platosEnReserva = cart.filter(
    (item) => item.type?.toLowerCase() === "platos",
  );

  const bebidasEnReserva = cart.filter(
    (item) => item.type?.toLowerCase() === "bebidas",
  );

  const subtotalPlatos = useMemo(() => {
    return platosEnReserva.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
  }, [platosEnReserva]);

  const subtotalBebidas = useMemo(() => {
    return bebidasEnReserva.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
  }, [bebidasEnReserva]);

  const totalGeneral = subtotalPlatos + subtotalBebidas;
  const costoMesaPorPersona = 2000;
  const totalMesa = peopleCount * costoMesaPorPersona;
  const señaComida = Math.round(totalGeneral * 0.15);
  const señaTotal = Math.round(señaComida + totalMesa);
  const totalFinal = Math.round(totalGeneral + totalMesa);
  const restoRestaurante = Math.round(totalFinal - señaTotal);

  const confirmarReserva = async () => {
    try {
      if (cart.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Reserva vacía",
          text: "Debes agregar al menos un plato o bebida",
          confirmButtonColor: "#000",
        });
        return;
      }

      const session = localStorage.getItem("userSession");
      const token = session ? JSON.parse(session).token : null;

      // ✅ Incluir platos Y bebidas
      const pedidos = cart.map((item) => ({
        platoId: item.id,
        quantity: item.quantity,
      }));

      const body = {
        reservationDate,
        startTime,
        peopleCount,
        notes: comentarios,
        pedidos,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "El servidor no devolvió un JSON válido");
      }

      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message) ? data.message.join(", ") : data.message,
        );
      }

      // ✅ Usar el ID que devuelve el backend directamente, sin hacer otro fetch
      const reservationId = data?.id || data?.reservationId;

      if (!reservationId) {
        // Fallback: buscar en myreservations si el back no devuelve el ID
        const resReservations = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/myreservations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!resReservations.ok)
          throw new Error("No se pudo obtener las reservas");

        const reservations = await resReservations.json();

        const sorted = [...reservations].sort((a, b) => {
          const dateA = new Date(
            `${a.reservationDate}T${a.startTime}`,
          ).getTime();
          const dateB = new Date(
            `${b.reservationDate}T${b.startTime}`,
          ).getTime();
          return dateB - dateA;
        });

        const idFallback = sorted[0]?.id;
        if (!idFallback) throw new Error("No se encontró el ID de la reserva");

        setReservationData({
          reservationDate: reservationDate ?? "",
          startTime,
          peopleCount,
          reservationId: idFallback,
        });

        console.log("reservationId (fallback):", idFallback); // debug
      } else {
        // ✅ Guardar en context con el ID directo del backend
        setReservationData({
          reservationDate: reservationDate ?? "",
          startTime,
          peopleCount,
          reservationId,
        });

        console.log("reservationId (directo):", reservationId); // debug
      }

      Swal.fire({
        icon: "success",
        title: "Platos seleccionados.",
        text: "Tus platos fueron seleccionados correctamente",
        confirmButtonColor: "#000",
      });

      router.push("/pagos");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudieron seleccionar los platos",
        confirmButtonColor: "#000",
      });
    }
  };

  return (
    <Protected>
      <div className="mx-auto mt-6 max-w-8xl">
        <section className="min-h-screen bg-[#f7efea]">
          <div className="bg-[radial-gradient(circle_at_top,#8b0d14_0%,#5d070b_45%,#3d0407_100%)] md:h-45">
            <div className="px-6 mx-auto max-w-7xl py-14 md:px-8 md:py-16">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition "
              >
                ← Volver
              </button>
              <h1 className="font-serif text-white md:text-4xl">
                Reservar platos y bebidas
              </h1>
              <p className="max-w-3xl mt-1 text-white/90 md:text-xl">
                Elegí tus platos y bebidas para reservarlos antes de tu visita.
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[1.7fr_0.9fr] lg:items-start">
            <div>
              <div className="h-13 mb-6 inline-flex items-center overflow-hidden rounded-2xl border border-[#d8b6ac] bg-[#f1dbd098] shadow-sm">
                <button
                  onClick={() => {
                    setActiveTab("platos");
                    setCurrentPage(1);
                    setCategoryFilter("todos");
                  }}
                  className={`px-8 py-4 text-xl font-medium transition ${
                    activeTab === "platos"
                      ? "bg-linear-to-r from-[#7c090c] to-[#520509] text-white"
                      : "bg-transparent text-[#6b3030]"
                  }`}
                >
                  Platos
                </button>

                <button
                  onClick={() => {
                    setActiveTab("bebidas");
                    setCurrentPage(1);
                    setCategoryFilter("todos");
                  }}
                  className={`px-8 py-4 text-xl font-medium transition ${
                    activeTab === "bebidas"
                      ? "bg-linear-to-r from-[#7c090c] to-[#520509] text-white"
                      : "bg-transparent text-[#6b3030]"
                  }`}
                >
                  Bebidas
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {categoryOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setCategoryFilter(option)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      categoryFilter === option
                        ? "bg-linear-to-r from-[#7c090c] to-[#520509] text-white"
                        : "border border-[#d8b6ac] bg-[#f1dbd098] text-[#6b3030]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {loading && (
                <p className="text-[#6b3030] text-lg">Cargando productos...</p>
              )}

              {!loading && (
                <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                  {filteredItems.length === 0 && (
                    <p className="text-[#6b3030] text-lg">
                      No hay productos para esta categoría.
                    </p>
                  )}

                  {filteredItems.map((item) => {
                    const quantity = getQuantity(item.id);
                    const isReserved = cart.some(
                      (cartItem) => cartItem.id === item.id,
                    );
                    const sinStock = item.stock === 0; // <-- Check stock

                    return (
                      <article
                        key={item.id}
                        className={`rounded-2xl border p-4 shadow-sm ${
                          sinStock
                            ? "border-gray-300 bg-gray-100 opacity-60" // <-- Grisado si sin stock
                            : "border-[#e5cfc5] bg-[#f1dbd098]"
                        }`}
                      >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[190px_1fr]">
                          <div className="relative overflow-hidden rounded-xl h-80">
                            <Link href={`/menu/${item.id}`}>
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="object-cover w-full h-48 md:h-full"
                              />
                            </Link>
                            {/* Badge sin stock */}
                            {sinStock && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                                <span className="px-3 py-1 text-sm font-bold text-white bg-red-600 rounded-full">
                                  Sin stock
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col justify-between">
                            <div>
                              <h3 className="text-xl font-bold leading-7 text-[#6d1e1e] mt-auto">
                                {item.name}
                              </h3>

                              <div className="my-3 h-px w-full bg-[#e3c8bf]" />

                              <p className="text-sm leading-6 text-[#5e4a45]">
                                {Array.isArray(item.ingredientes)
                                  ? item.ingredientes.join(", ")
                                  : item.ingredientes}
                              </p>

                              <h3 className="text-xl font-semibold leading-tight text-[#6d1e1e] flex items-center justify-center">
                                ${item.price}
                              </h3>
                            </div>

                            <div className="mt-3">
                              <div className="flex items-center overflow-hidden rounded-xl border border-[#e5cfc5] bg-[#fff7f2] shadow-sm w-fit">
                                <button
                                  onClick={() => disminuirCantidad(item.id)}
                                  disabled={sinStock}
                                  className="flex h-10 w-10 items-center justify-center text-3xl text-[#7c090c] transition hover:bg-[#f6e2d9] disabled:opacity-50"
                                >
                                  -
                                </button>

                                <div className="flex h-10 min-w-14 items-center justify-center border-x border-[#e5cfc5] px-4 text-lg font-semibold text-[#6d1e1e]">
                                  {quantity}
                                </div>

                                <button
                                  onClick={() => aumentarCantidad(item.id)}
                                  disabled={sinStock}
                                  className="flex h-10 w-10 items-center justify-center bg-[#7c090c] text-3xl text-white transition hover:brightness-110 disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>

                              <div className="relative flex flex-col gap-2 mt-3 overflow-hidden font-semibold text-white transition duration-300 rounded-md shadow-lg cursor-pointer bg-gradient-to-r group">
                                <button
                                  onClick={() => agregarAlCarrito(item)}
                                  disabled={sinStock}
                                  className="relative overflow-hidden py-2 w-full bg-linear-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-md shadow-lg transition duration-300 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="absolute inset-0 transition-transform -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                                  {sinStock
                                    ? "Sin stock"
                                    : isReserved
                                      ? activeTab === "platos"
                                        ? "Ya reservado"
                                        : "Ya reservada"
                                      : activeTab === "platos"
                                        ? "Reservar plato"
                                        : "Reservar bebida"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {!loading && activeTab === "platos" && totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                    }}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-[#d8b6ac] bg-[#f8ece6] px-4 py-2 text-[#6b3030] disabled:opacity-50"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-4 py-2 ${
                          currentPage === page
                            ? "bg-[#7c090c] text-white"
                            : "border border-[#d8b6ac] bg-[#f1dbd098] text-[#6b3030]"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    }}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-[#d8b6ac] bg-[#f8ece6] px-4 py-2 text-[#6b3030] disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6 lg:sticky lg:top-6">
              <div className="rounded-2xl border border-[#e5cfc5] bg-[#f1dbd098] p-6 shadow-sm">
                <h2 className="text-4xl font-serif text-[#6d1e1e] h-10">
                  TU RESERVA
                </h2>

                <h2 className="text-2xl font-serif text-[#6d1e1e] h-3">
                  Platos
                </h2>

                <div className="my-5 h-px bg-[#e3c8bf]" />

                <div className="space-y-4">
                  {platosEnReserva.length === 0 ? (
                    <p className="text-lg text-[#7b6761]">
                      No agregaste platos todavía.
                    </p>
                  ) : (
                    platosEnReserva.map((item) => (
                      <div
                        key={`plato-${item.id}`}
                        className="flex items-center justify-between gap-4 text-lg"
                      >
                        <p className="text-[#4f2b2b]">
                          {item.name}
                          <span className="text-[#8c6a61] ml-1">
                            x{item.quantity}
                          </span>
                        </p>

                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-[#4f2b2b]">
                            ${item.price * item.quantity}
                          </p>

                          <button
                            onClick={() => eliminarDelCarrito(item.id)}
                            className="flex items-center justify-center w-6 h-6 text-xs text-white transition bg-red-600 rounded-full hover:bg-red-700"
                          >
                            X
                          </button>

                          <button
                            onClick={() => eliminarTodoDelCarrito(item.id)}
                            className="flex items-center justify-center w-6 h-6 text-xs text-white transition bg-red-600 rounded-full hover:bg-red-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-linear-to-r from-[#e20b16] to-[#7e080d] text-white shadow-md hover:brightness-150 transition"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 6h18"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 6V4h8v2"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 6l-1 14H6L5 6"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 11v6"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14 11v6"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <h2 className="text-2xl font-serif text-[#6d1e1e] mt-8 h-3">
                  Bebidas
                </h2>

                <div className="my-5 h-px bg-[#e3c8bf]" />

                <div className="space-y-4">
                  {bebidasEnReserva.length === 0 ? (
                    <p className="text-lg text-[#7b6761]">
                      No agregaste bebidas todavía.
                    </p>
                  ) : (
                    bebidasEnReserva.map((item) => (
                      <div
                        key={`bebida-${item.id}`}
                        className="flex items-center justify-between gap-4 text-lg"
                      >
                        <p className="text-[#4f2b2b]">
                          {item.name}
                          <span className="text-[#8c6a61] ml-1">
                            x{item.quantity}
                          </span>
                        </p>

                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-[#4f2b2b]">
                            ${item.price * item.quantity}
                          </p>

                          <button
                            onClick={() => eliminarDelCarrito(item.id)}
                            className="flex items-center justify-center w-6 h-6 text-xs text-white transition bg-red-600 rounded-full hover:bg-red-700"
                          >
                            -
                          </button>

                          <button
                            onClick={() => eliminarTodoDelCarrito(item.id)}
                            className="flex items-center justify-center w-6 h-6 text-xs text-white transition bg-red-600 rounded-full hover:bg-red-700"
                          >
                            x
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Comentarios adicionales..."
                  className="mt-6 w-full rounded-xl border border-[#e5cfc5] bg-white/80 p-3 outline-none"
                />

                <div className="flex items-center justify-between h-2 mt-6 text-s">
                  <p className="text-[#5c2c2c]">Subtotal de platos</p>
                  <p className="font-semibold text-[#5c0f14]">
                    ${subtotalPlatos}
                  </p>
                </div>

                <div className="flex items-center justify-between h-2 mt-4 text-s">
                  <p className="text-[#5c2c2c]">Subtotal de bebidas</p>
                  <p className="font-semibold text-[#5c0f14]">
                    ${subtotalBebidas}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-lg">
                    <p>Reserva del menú(15%)</p>
                    <p>${señaComida}</p>
                  </div>

                  <div className="flex justify-between text-lg">
                    <p>
                      Reserva de mesa (${costoMesaPorPersona} x {peopleCount})
                    </p>
                    <p>${totalMesa}</p>
                  </div>

                  <div className="my-2 border-t" />

                  <div className="flex justify-between text-lg font-semibold">
                    <p>Total General</p>
                    <p>${totalFinal}</p>
                  </div>

                  <div className="flex justify-between text-lg text-[#7c090c] font-bold">
                    <p>Seña a pagar ahora</p>
                    <p>${señaTotal}</p>
                  </div>

                  <div className="flex justify-between text-lg text-[#5c2c2c]">
                    <p>Resto del pago en el restaurante</p>
                    <p>${restoRestaurante}</p>
                  </div>

                  <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => router.back()}
                    className="relative overflow-hidden py-2 px-6 w-auto border-2 border-[#7c090c] text-[#7c090c] font-semibold rounded-md shadow-lg transition duration-300 cursor-pointer whitespace-nowrap"
                  >
                    ← Volver
                  </button>
                  <button
                    className="relative overflow-hidden py-2 w-full bg-linear-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-md shadow-lg transition duration-300 group cursor-pointer"
                    onClick={confirmarReserva}
                  >
                    Confirmar reserva (${señaTotal})
                    <span className="absolute inset-0 transition-transform -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Protected>
  );
}
