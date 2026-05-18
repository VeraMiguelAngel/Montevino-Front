"use client";
import Link from "next/link";

const hostLinks = [
  { href: "/host", label: "Dashboard" },
  { href: "/host/reservas", label: "Reservas" },
  { href: "/host/ordenes", label: "Órdenes en curso" },
];

const HostSidebar = ({
  open,
  }: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) => {
  return (
    <aside
      className={`
        ${open ? "block" : "hidden"}
        w-64 min-h-[80vh] bg-[#350A06] text-[#FED0BB] flex flex-col py-8 px-4 mr-3
        transition-all duration-300
      `}
    >
      <nav className="sticky flex flex-col gap-4 top-30">
        {hostLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="py-2 px-4 rounded-lg hover:bg-[#56070C] transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default HostSidebar;