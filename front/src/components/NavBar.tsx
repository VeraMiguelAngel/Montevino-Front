"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext"; // importa tu hook
import { usePathname, useRouter } from "next/navigation";

type NavbarProps = {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
};

export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const { userData, handleLogout } = useAuth();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const isAdmin = userData?.user?.role === "ADMIN";
  const isHost = userData?.user?.role === "HOST";

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/menu", label: "Menú" },
  ];

  if (userData) {
    links.push({ href: "/reservar", label: "Reservar" });
    links.push({ href: "/mis-reservas", label: "Mis Reservas" });
    links.push({ href: "/dashboard-user", label: "Usuario" });
    }

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin" });
  }
  if (isHost) links.push({ href: "/host", label: "Panel de Reservas"});

  return (
    <>
      <nav className="fixed top-0 w-full bg-linear-to-r flex from-[#350A06] to-[#56070C] text-[#FED0BB] z-50">
        <div className="flex items-center justify-center ml-10 text-center">
          {/* Botón para mostrar/ocultar sidebar solo en admin */}
          {isAdmin && isAdminRoute && setSidebarOpen && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={
                sidebarOpen ? "Cerrar menú lateral" : "Abrir menú lateral"
              }
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
          )}
        </div>

        <div className="w-[80%] mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo Montevino"
              width={100}
              height={70}
              className="object-contain max-h-14 scale-[2.5]"
              priority
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden space-x-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#FFD580] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Botón destacado → Iniciar sesión o Cerrar sesión */}
          {!userData ? (
            <Link
              href="/login"
              className="relative overflow-hidden bg-gradient-to-r hidden md:inline-block ml-4 bg-[#FED0BB] text-[#350A06] px-4 py-2 rounded-lg font-semibold hover:bg-[#350A06] hover:text-[#FED0BB] transition duration-300 group"
            >
              Iniciar sesión
              <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-[#4a1414f7] to-[#56070C] text-FED0BB font-semibold rounded-md transition duration-300 group"
            >
              Cerrar sesión
              <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-2xl text-[#FED0BB] focus:outline-none"
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-[#350A06]/95 px-6 py-4 space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-lg text-[#FED0BB] hover:text-[#FFD580] transition"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!userData ? (
              <Link
                href="/login"
                className="relative overflow-hidden py-2 w-full bg-gradient-to-r from-[#4a1414f7] to-[#56070C] text-white font-semibold rounded-md  transition duration-300 group"
                onClick={() => setOpen(false)}
              >
                Iniciar sesión
                <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="relative overflow-hidden py-2 w-full bg-gradient-to-r from-[#4a1414f7] to-[#56070C] text-white font-semibold rounded-md transition duration-300 group"
              >
                Cerrar sesión
                <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
              </button>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
