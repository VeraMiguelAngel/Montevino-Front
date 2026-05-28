"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Protected from "@/components/Protected";
import { createReservation } from "@/services/reservations.service";
import PersonSelector from "./PersonSelector";
import CalendarCustom from "./CalendarCuston";
import TimeGrid from "./Time.Grid";
import Swal from "sweetalert2";
import { useReservation } from "@/context/ReservationContext";
import { useAuth } from "@/context/AuthContext";

export default function BookingForm() {
  const [guests, setGuests] = useState(3);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("11:45hs");
  const [showOptions, setShowOptions] = useState(false);

  const { setReservationData } = useReservation();
  const router = useRouter();

  const { userData, isAuthReady } = useAuth();

useEffect(() => {
  if (!isAuthReady) return;
  if (userData?.user?.role === "ADMIN" || 
      userData?.user?.role === "HOST" || 
      userData?.user?.role === "MOZO") {
    router.push("/");
  }
}, [isAuthReady, userData]);

  const VALID_TIMES = ["18:00", "20:00", "22:00", "00:00"];

  const formatDate = (d: Date | undefined) => {
    if (!d) return "";
    return d.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const validarYContinuar = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDay = date ? new Date(date) : null;
    if (selectedDay) selectedDay.setHours(0, 0, 0, 0);

    if (!selectedDay || selectedDay <= today) {
      Swal.fire({
        icon: "warning",
        title: "Fecha inválida",
        text: "Por favor seleccioná una fecha futura.",
        confirmButtonColor: "#7c090c",
      });
      return;
    }

    if (!VALID_TIMES.includes(time)) {
      Swal.fire({
        icon: "warning",
        title: "Horario no seleccionado",
        text: "Por favor seleccioná un horario disponible.",
        confirmButtonColor: "#7c090c",
      });
      return;
    }

    setShowOptions(true);
  };

  // ✅ Función reutilizable para crear la reserva
  const crearReserva = async () => {
    const fechaString = date ? format(date, "yyyy-MM-dd") : "";
    const horaString = time.replace("hs", "").trim();

    const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
    const token = session?.token;

    // 1️⃣ Crear la reserva
    await createReservation({
      reservationDate: fechaString,
      startTime: horaString,
      peopleCount: guests,
      notes: "",
      pedidos: [],
    });

    // 2️⃣ Obtener las reservas del usuario para agarrar el ID de la última
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reservations/myreservations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) throw new Error("No se pudo obtener las reservas");

    const reservations = await res.json();

    const sorted = [...reservations].sort((a, b) => {
      const dateA = new Date(`${a.reservationDate}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.reservationDate}T${b.startTime}`).getTime();
      return dateB - dateA;
    });

    const lastReservation = sorted[0];
    const reservationId = lastReservation?.id;

    if (!reservationId) throw new Error("No se encontró el ID de la reserva");

    // 4️⃣ Guardar en el context
    setReservationData({
      reservationDate: fechaString,
      startTime: horaString,
      peopleCount: guests,
      reservationId,
    });

    return { fechaString, horaString, reservationId };
  };

  const irAPlatillos = () => {
    const fechaString = date ? format(date, "yyyy-MM-dd") : "";
    const horaString = time.replace("hs", "").trim();

    // ✅ Solo guardar datos en el context, SIN crear la reserva
    setReservationData({
      reservationDate: fechaString,
      startTime: horaString,
      peopleCount: guests,
    });

    router.push(
      `/reservar/platos?fecha=${fechaString}&hora=${horaString}&personas=${guests}`,
    );
  };

  const reservarDirecto = async () => {
    try {
      const fechaString = date ? format(date, "yyyy-MM-dd") : "";
      const horaString = time.replace("hs", "").trim();

      const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
      const token = session?.token;

      // ✅ Crear reserva sin platos solo cuando va directo al pago
      await createReservation({
        reservationDate: fechaString,
        startTime: horaString,
        peopleCount: guests,
        notes: "",
        pedidos: [],
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/myreservations`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const reservations = await res.json();

      const sorted = [...reservations].sort((a, b) => {
        const dateA = new Date(`${a.reservationDate}T${a.startTime}`).getTime();
        const dateB = new Date(`${b.reservationDate}T${b.startTime}`).getTime();
        return dateB - dateA;
      });

      const reservationId = sorted[0]?.id;

      setReservationData({
        reservationDate: fechaString,
        startTime: horaString,
        peopleCount: guests,
        reservationId,
      });

      router.push("/pagos");
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la reserva. Intentá de nuevo.",
        confirmButtonColor: "#7c090c",
      });
    }
  };

  return (
    <Protected>
      <div className="max-w-xl mx-auto p-4 sm:p-8 bg-[#f1dbd098] rounded-4xl border border-slate-950 shadow-sm mt-4 sm:mt-10 w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-[#7c090c] hover:underline cursor-pointer"
        >
          ← Volver
        </button>
        <h1 className="mb-8 text-2xl font-bold text-slate-800">
          Configura tu reserva
        </h1>

        <PersonSelector selected={guests} onSelect={setGuests} />

        <CalendarCustom selectedDate={date} onSelect={setDate} />

        <TimeGrid selectedTime={time} onSelect={setTime} />

        {/* Barra Inferior */}
        <div className="flex flex-col gap-4 p-4 sm:p-5 mt-10 bg-white border shadow-md border-slate-200 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold capitalize text-slate-800">
                {formatDate(date)} - {time}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {guests} personas
              </span>
            </div>

            {!showOptions ? (
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => router.back()}
                  className="relative overflow-hidden py-2 px-6 w-full sm:w-auto border-2 border-[#7c090c] text-[#7c090c] font-semibold rounded-md shadow-lg transition duration-300 cursor-pointer"
                >
                  ← Volver
                </button>
                <button
                  onClick={validarYContinuar}
                  className="relative overflow-hidden py-2 px-6 w-full sm:w-auto bg-linear-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-md shadow-lg transition duration-300 group cursor-pointer"
                >
                  Continuar
                  <span className="absolute inset-0 transition-transform -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="flex gap-3">
                  <button
                    onClick={() => router.back()}
                    className="relative overflow-hidden py-2 px-6 w-full border-2 border-[#7c090c] text-[#7c090c] font-semibold rounded-md shadow-lg transition duration-300 cursor-pointer"
                  >
                    ← Volver
                  </button>
                  <button
                    onClick={irAPlatillos}
                    className="relative overflow-hidden py-2 px-6 w-full bg-linear-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-md shadow-lg transition duration-300 group cursor-pointer"
                  >
                    Elegir Platillos
                    <span className="absolute inset-0 transition-transform -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                  </button>
                </div>
                <button
                  onClick={reservarDirecto}
                  className="text-[15px] text-black underline text-center cursor-pointer"
                >
                  Omitir y reservar mesa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Protected>
  );
}
