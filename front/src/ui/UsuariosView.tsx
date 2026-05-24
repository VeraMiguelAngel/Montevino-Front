"use client";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import {
  promoteUserRole,
  desactivateUser,
  getUsers,
  getUsersById,
  activateUser,
  makeHost,
  makeWaiter,
  makeUser,
} from "@/services/usersService";
import { IUser } from "@/types/types";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const UsuariosView = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [usuarioDetalle, setUsuarioDetalle] = useState<any | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const { isAuthReady, userData, checkAdmin } = useAuth();

  useEffect(() => {
    if (!isAuthReady || !userData) return;
    const init = async () => {
      checkAdmin();
      if (userData.user.role !== "ADMIN") return;
      try {
        const data = await getUsers();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error(error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, userData]);

  const handleVerDetalle = async (id: string) => {
    setLoadingDetalle(true);
    try {
      const data = await getUsersById(id);
      setUsuarioDetalle(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleChangeRole = async (userId: string, nuevoRol: string) => {
    let response;
    if (nuevoRol === "USER") response = await makeUser(userId);
    else if (nuevoRol === "HOST") response = await makeHost(userId);
    else if (nuevoRol === "MOZO") response = await makeWaiter(userId);
    else return;

    if (response) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: nuevoRol } : user
        )
      );
      Swal.fire({
        title: "Rol actualizado",
        text: `El usuario ahora es ${nuevoRol}`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#000",
      });
    }
  };

  if (!isAuthReady || !userData) return null;

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="h-full mt-20 w-full bg-[#F6E3D9] flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-col items-center justify-center flex-1 mx-10 mb-10">
          <h2 className="pt-10 mb-10 text-5xl text-center text-red-950">
            Usuarios
          </h2>
          <div className="flex justify-center gap-5">
            <div className="w-full h-full p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.20)] bg-white overflow-hidden">
              <h3 className="mb-4 text-3xl text-red-950">Usuarios Activos</h3>
              <table className="w-full table-fixed">
                <thead className="text-sm text-black bg-gray-100">
                  <tr>
                    <th className="w-1/5 px-3 py-3 text-center">Nombre</th>
                    <th className="w-1/5 px-3 py-3 text-center">Correo</th>
                    <th className="w-1/5 px-3 py-3 text-center">Rol</th>
                    <th className="w-1/5 px-3 py-3 text-center">Cambiar Rol</th>
                    <th className="w-1/5 px-3 py-3 text-center">Deshabilitar</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.filter((u) => u.isActive).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center">
                        <h2>No hay usuarios para mostrar.</h2>
                      </td>
                    </tr>
                  ) : (
                    users
                      .filter((u) => u.isActive)
                      .map((u, i) => (
                        <tr
                          key={i}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleVerDetalle(u.id)}
                        >
                          <td className="w-1/5 px-3 py-3 text-center truncate">
                            {u.name}
                          </td>
                          <td className="w-1/5 px-3 py-3 text-center truncate">
                            {u.email}
                          </td>
                          <td className="w-1/5 px-3 py-3 text-center">
                            {u.role}
                          </td>
                          <td
                            className="w-1/5 px-3 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {u.id === userData.user.id ? (
                              <span className="text-sm text-gray-400">—</span>
                            ) : (
                              <select
                                value={u.role}
                                onChange={async (e) => handleChangeRole(u.id, e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#56070C]"
                              >
                                <option value="USER">USER</option>
                                <option value="HOST">HOST</option>
                                <option value="MOZO">MOZO</option>
                              </select>
                            )}
                          </td>
                          <td
                            className="w-1/5 px-3 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {u.id === userData.user.id ? (
                              <span className="text-sm text-gray-400">—</span>
                            ) : (
                              <button
                                className="relative overflow-hidden py-2 px-3 bg-gradient-to-r from-[#3d0c07] to-[#56070C] text-white font-semibold rounded-md shadow-lg transition duration-300 group cursor-pointer text-[15px]"
                                onClick={async () => {
                                  const response = await desactivateUser(u.id);
                                  if (response) {
                                    setUsers((prevUsers) =>
                                      prevUsers.map((user) =>
                                        user.id === u.id
                                          ? { ...user, isActive: false }
                                          : user
                                      )
                                    );
                                    Swal.fire({
                                      title: "Usuario deshabilitado",
                                      text: "El usuario ha sido deshabilitado correctamente",
                                      icon: "success",
                                      confirmButtonText: "Aceptar",
                                      confirmButtonColor: "#000",
                                    });
                                  }
                                }}
                              >
                                DESHABILITAR
                                <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center gap-5 mt-10">
            <div className="w-full h-full p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.20)] bg-white overflow-hidden">
              <h3 className="mb-4 text-3xl text-red-950">
                Usuarios Deshabilitados
              </h3>
              <table className="w-full table-fixed">
                <thead className="text-sm text-black bg-gray-100">
                  <tr>
                    <th className="w-1/5 px-3 py-3 text-center">Nombre</th>
                    <th className="w-1/5 px-3 py-3 text-center">Correo</th>
                    <th className="w-1/5 px-3 py-3 text-center">Rol</th>
                    <th className="w-1/5 px-3 py-3 text-center">Rol</th>
                    <th className="w-1/5 px-3 py-3 text-center">Activar</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.filter((u) => !u.isActive).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center">
                        <h2>No hay usuarios para mostrar.</h2>
                      </td>
                    </tr>
                  ) : (
                    users
                      .filter((u) => !u.isActive)
                      .map((u, i) => (
                        <tr
                          key={i}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleVerDetalle(u.id)}
                        >
                          <td className="w-1/5 px-3 py-3 text-center truncate">
                            {u.name}
                          </td>
                          <td className="w-1/5 px-3 py-3 text-center truncate">
                            {u.email}
                          </td>
                          <td className="w-1/5 px-3 py-3 text-center">
                            {u.role}
                          </td>
                          <td
                            className="w-1/5 px-3 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-sm text-gray-400">—</span>
                          </td>
                          <td
                            className="w-1/5 px-3 py-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="relative overflow-hidden py-2 px-3 bg-gradient-to-r from-[#3d0c07] to-[#56070C] text-white font-semibold rounded-md shadow-lg transition duration-300 group cursor-pointer text-[15px]"
                              onClick={async () => {
                                const response = await activateUser(u.id);
                                if (response) {
                                  setUsers((prevUsers) =>
                                    prevUsers.map((user) =>
                                      user.id === u.id
                                        ? { ...user, isActive: true }
                                        : user
                                    )
                                  );
                                  Swal.fire({
                                    title: "Usuario activado",
                                    text: "El usuario ha sido activado correctamente",
                                    icon: "success",
                                    confirmButtonText: "Aceptar",
                                    confirmButtonColor: "#000",
                                  });
                                }
                              }}
                            >
                              HABILITAR
                              <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal detalle usuario */}
      {usuarioDetalle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
          onClick={() => setUsuarioDetalle(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingDetalle ? (
              <p className="text-center text-gray-500">Cargando...</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-red-950">
                    Detalle del Usuario
                  </h2>
                  <button
                    onClick={() => setUsuarioDetalle(null)}
                    className="text-2xl text-gray-400 transition-colors hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 mb-5 transition-colors border border-gray-200 rounded-xl hover:bg-gray-50">
                  <div>
                    <span className="font-semibold">Nombre:</span>{" "}
                    {usuarioDetalle.name}
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>{" "}
                    {usuarioDetalle.email}
                  </div>
                  <div>
                    <span className="font-semibold">Rol:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuarioDetalle.role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {usuarioDetalle.role}
                    </span>
                  </div>
                </div>

                <h3 className="mb-4 text-xl font-semibold text-red-950">
                  Reservas ({usuarioDetalle.reservations?.length ?? 0})
                </h3>

                {!usuarioDetalle.reservations ||
                usuarioDetalle.reservations.length === 0 ? (
                  <p className="py-4 text-center text-gray-400">
                    Este usuario no tiene reservas.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {usuarioDetalle.reservations.map((r: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 transition-colors border border-gray-200 rounded-xl hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">
                            {r.reservationDate}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.status?.toLowerCase() === "confirmada"
                                ? "bg-green-100 text-green-700"
                                : r.status?.toLowerCase() === "pago pendiente"
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Hora:</span>{" "}
                            {r.startTime}
                          </div>
                          <div>
                            <span className="font-medium">Personas:</span>{" "}
                            {r.peopleCount}
                          </div>
                          <div>
                            <span className="font-medium">Mesa:</span>{" "}
                            {r.table?.tableNumber ?? "Sin mesa"}
                          </div>
                          <div>
                            <span className="font-medium">Total:</span> $
                            {Number(r.totalPrice ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UsuariosView;