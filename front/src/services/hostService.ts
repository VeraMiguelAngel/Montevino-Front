const BACKURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const getToken = () => {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;
  if (!token) throw new Error("No hay token de autenticación");
  return token;
};

export const getTodayReservations = async () => {
  const token = getToken();
  const res = await fetch(`${BACKURL}/host/reservations/today`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al traer las reservas del día");
  return res.json();
};

export const getReservationsByDate = async (date: string) => {
  const token = getToken();
  const res = await fetch(`${BACKURL}/host/reservations?date=${date}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al traer las reservas");
  return res.json();
};

export const checkIn = async (reservationId: string) => {
  const token = getToken();
  const res = await fetch(`${BACKURL}/host/reservations/${reservationId}/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al hacer check-in");
  return res.json();
};

export const getHostOrder = async (hostOrderId: string) => {
  const token = getToken();
  const res = await fetch(`${BACKURL}/host/orders/${hostOrderId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al traer la orden");
  return res.json();
};

export const deliverPedido = async (pedidoId: string) => {
  const token = getToken();
  const res = await fetch(`${BACKURL}/host/pedidos/${pedidoId}/deliver`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al marcar pedido como entregado");
  return res.json();
};  