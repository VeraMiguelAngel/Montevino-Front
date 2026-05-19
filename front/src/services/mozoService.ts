const BACKURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const getToken = () => {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;
  if (!token) throw new Error("No hay token de autenticación");
  return token;
};

export const getActiveOrders = async () => {
  const token = getToken();
  const res = await fetch(`${BACKURL}/mozo/orders`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al traer las órdenes activas");
  return res.json();
};

export const getOrder = async (orderId: string) => {
  const token = getToken();
  const res = await fetch(`${BACKURL}/mozo/orders/${orderId}`, {
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
  const res = await fetch(`${BACKURL}/mozo/pedidos/${pedidoId}/deliver`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al marcar pedido como entregado");
  return res.json();
};

export const addPedido = async (orderId: string, platoId: string, quantity: number) => {
  const token = getToken();
  const res = await fetch(`${BACKURL}/mozo/orders/${orderId}/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ platoId, quantity }),
  });
  if (!res.ok) throw new Error("Error al agregar pedido");
  return res.json();
};

export const closeOrder = async (orderId: string) => {
  const token = getToken();
  const res = await fetch(`${BACKURL}/mozo/orders/${orderId}/close`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al cerrar la orden");
  return res.json();
};