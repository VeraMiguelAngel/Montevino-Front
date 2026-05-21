const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export interface IReservation {
  id: string;
  reservationDate: string;
  startTime: string;
  peopleCount: number;
  totalPrice: number | string;
  depositAmount?: number | string;
  status: string;
  notes?: string;
  pedidos?: Array<{
    id: string;
    quantity: number;
    price?: number | string;
    platoId?: string;
    bebidaId?: string;
    menuItem?: {
      name?: string;
      imageUrl?: string;
      type?: string;
    };
  }>;
}

export interface IUserWithReservations {
  id: string;
  name: string;
  email: string;
  role: string;
  reservations: IReservation[];
}

export async function getCurrentUserWithReservations(): Promise<IUserWithReservations> {
  const sessionRaw =
    typeof window !== "undefined" ? localStorage.getItem("userSession") : null;

  if (!sessionRaw) {
    throw new Error("No hay sesión iniciada");
  }

  const session = JSON.parse(sessionRaw);
  const token = session?.token;
  const userId = session?.user?.id;

  if (!token || !userId) {
    throw new Error("Sesión inválida");
  }

  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "No se pudieron obtener las reservas");
  }

  return data;
}

const BACKURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getUsers() {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;

  try {
    const response = await fetch(`${BACKURL}/users`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function getUsersById(id: string) {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;

  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  try {
    const response = await fetch(`${BACKURL}/users/${id}`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function promoteUserRole(id: string) {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  try {
    const response = await fetch(`${BACKURL}/users/${id}/makeadmin`, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error al promover el usuario",
    );
  }
}

export async function desactivateUser(id: string) {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;

  try {
    const response = await fetch(`${BACKURL}/users/${id}/desactivate`, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error al eliminar usuario",
    );
  }
}

export async function activateUser(id: string) {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;

  try {
    const response = await fetch(`${BACKURL}/users/${id}/activate`, {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error al eliminar usuario",
    );
  }
}

export async function makeHost(id: string) {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;
  if (!token) throw new Error("No hay token de autenticación");

  const response = await fetch(`${BACKURL}/users/${id}/makehost`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
}

export async function makeWaiter(id: string) {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;
  if (!token) throw new Error("No hay token de autenticación");

  const response = await fetch(`${BACKURL}/users/${id}/makewaiter`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
}
