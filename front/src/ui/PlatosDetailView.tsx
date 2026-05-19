"use client";
import { IProduct } from "@/types/types";
import Link from "next/link";
import Swal from "sweetalert2";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
 

interface Props {
  plato: IProduct;
}

const PlatosDetailView = ({ plato }: Props) => {
  const { userData } = useContext(AuthContext);
  const router = useRouter();
  
  const isAdmin = userData?.user?.role === "ADMIN";
  const isHost = userData?.user?.role === "HOST";

  const handleReserva = async () => {
  if (!userData) {
    await Swal.fire({
      icon: "info",
      title: "Debes iniciar sesión.",
      text: "Para reservar debes iniciar sesión, en caso de que no tener una cuenta debes registrarte.",
      confirmButtonText: "Iniciar sesión",
      confirmButtonColor: "#56070C",
    });

    router.push("/login");
    return;
  }

  router.push("/reservar");
};

  return (
    <section className="mt-15 min-h-screen bg-gradient-to-b from-[#fcf7f3] to-[#f7efea] py-10">
  <div className="mx-auto max-w-4xl px-4">

    <div className="overflow-hidden rounded-2xl  bg-[#fdeadf] shadow-md">

      <div className="grid gap-8 p-6 md:grid-cols-2">

        <div className="flex items-center justify-center">
          <div className="w-full overflow-hidden rounded-xl bg-[#f6ece7]">
            <img
              src={plato.imageUrl}
              alt={plato.name}
              className="h-[260px] w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between">

          <div>

            <h1 className="font-serif text-3xl text-[#7b1e26]">
              {plato.name}
            </h1>

            <p className="mt-2 text-2xl font-semibold text-[#4b1f1f]">
              ${plato.price}
            </p>

            <div className="my-5 h-px bg-[#ead7cf]" />
            <div className="mb-4">
              <p className="font-semibold text-[#7c090c]">
                Ingredientes
              </p>

              <p className="text-sm text-[#5e4a45] mt-1">
                {Array.isArray(plato.ingredientes)
                  ? plato.ingredientes.join(", ")
                  : plato.ingredientes}
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#7c090c]">
                Descripción
              </p>
              

              <p className="text-sm text-[#5e4a45] leading-relaxed mt-1">
                {plato.description}
              </p>
            </div>

          </div>

          <div className="mt-6 flex gap-3">

            <Link href="/menu" className="w-full">
              <button className="relative overflow-hidden py-2 w-full bg-gradient-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-md shadow-lg transition duration-300 group cursor-pointer">
              <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
                Volver al menú
              </button>
            </Link>

            {!isAdmin && !isHost && (
              <button
                onClick={handleReserva}
                className="relative overflow-hidden py-2 w-full bg-gradient-to-r from-[#7c090c] to-[#520509] text-white font-semibold rounded-md            shadow-lg transition duration-300 group cursor-pointer"
              >
                <span className="absolute inset-0 transition-transform -translate-x-full bg-gradient-to-r from-transparent via-white/40             to-transparent group-hover:translate-x-full duration-1500"></span>
                Reservar
              </button>
            )}

          </div>

        </div>
      </div>
    </div>

  </div>
</section>
  );
};

  
export default PlatosDetailView;
