const BACKURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const getReservations = async () => {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;

  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  try {
    const res = await fetch(`${BACKURL}/reservations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Error al traer las reservas");
    }

    const data = await res.json();

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const getMyReservations = async () => {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;

  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  try {
    const res = await fetch(`${BACKURL}/reservations/myreservations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Error al traer las reservas");
    }

    return await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const getTables = async () => {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;
  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  try {
    const res = await fetch(`${BACKURL}/tables`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Error al traer las mesas");
    }

    const data = await res.json();

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const getTablesAvailability = async (fecha: string, hora: string) => {
  const session = JSON.parse(localStorage.getItem("userSession") ?? "null");
  const token = session?.token;
  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  try {
    const res = await fetch(
      `${BACKURL}/tables/availability?date=${fecha}&time=${hora}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error("Error al traer la disponibilidad de mesas");
    }

    const data = await res.json();

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

