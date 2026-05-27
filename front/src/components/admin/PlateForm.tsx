"use client";
import { useAuth } from "@/context/AuthContext";
import { dishValidation } from "@/lib/validations";
import { createPlato } from "@/services/platosService";
import { ICategory } from "@/types/types";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PlateForm = () => {
  const [categorias, setCategorias] = useState<ICategory[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // <-- Preview
  const BACKURL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const { checkAdmin, isAuthReady, userData } = useAuth();
  const tipos = [
    { id: "platos", name: "Platos" },
    { id: "bebidas", name: "Bebidas" },
  ];

  useEffect(() => {
    if (!isAuthReady || !userData) return;
    const init = async () => {
      checkAdmin();
      if (userData.user.role !== "ADMIN") return;
      fetch(`${BACKURL}/categories`)
        .then((res) => res.json())
        .then((data) => setCategorias(data))
        .catch(() => setCategorias([]));
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BACKURL, userData, isAuthReady]);

  if (!isAuthReady || !userData) return null;

  return (
    <div className="bg-[#F6E3D9]">
      <div className="flex flex-col items-center justify-center">
        <Formik
          initialValues={{
            name: "",
            description: "",
            ingredientes: "",
            price: 0,
            file: null as File | null, // <-- Tipado correcto
            categoryId: "",
            stock: 0,
            type: "",
          }}
          validate={dishValidation}
          onSubmit={async (values) => {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);
            formData.append("ingredientes", values.ingredientes);
            formData.append("price", String(values.price));
            formData.append("stock", String(values.stock));
            formData.append("categoryId", values.categoryId);
            formData.append("type", values.type);
            if (values.file instanceof File) {
              // <-- Verifica que sea un File real
              formData.append("file", values.file);
            }
            await createPlato(formData, router);
          }}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="flex flex-col items-center justify-center w-full max-w-lg gap-3 py-10 shadow-[0_0_15px_rgba(0,0,0,0.20)] px-7 bg-white rounded-2xl mb-20 mt-35">
              <h1 className="text-3xl text-[#56070C]">Crear Plato</h1>
              <label htmlFor="name" className="self-start">
                Nombre
              </label>
              <Field
                id="name"
                type="text"
                name="name"
                placeholder="Pasta al Pesto"
                className="w-full p-2 border border-gray-300 rounded-md outline-none focus-within:ring-1 focus-within:ring-[#FED0BB]"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="self-start text-red-500"
              />

              <label htmlFor="description" className="self-start">
                Descripcion
              </label>
              <div className="flex items-center w-full border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-[#FED0BB]">
                <Field
                  id="description"
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Pasta al dente con salsa pesto de..."
                  className="w-full p-2 outline-none resize-none"
                />
              </div>
              <ErrorMessage
                name="description"
                component="div"
                className="self-start text-red-500"
              />

              <label htmlFor="ingredientes" className="self-start">
                Ingredientes
              </label>
              <div className="flex items-center w-full border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-[#FED0BB]">
                <Field
                  id="ingredientes"
                  as="textarea"
                  rows={3}
                  name="ingredientes"
                  placeholder="Pasta al dente con salsa pesto de..."
                  className="w-full p-2 outline-none resize-none"
                />
              </div>
              <ErrorMessage
                name="ingredientes"
                component="div"
                className="self-start text-red-500"
              />

              <label htmlFor="price" className="self-start">
                Precio
              </label>
              <div className="flex items-center w-full border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-[#FED0BB]">
                <Field
                  id="price"
                  type="number"
                  name="price"
                  placeholder="35.000"
                  className="w-full p-2 outline-none"
                />
              </div>
              <ErrorMessage
                name="price"
                component="div"
                className="self-start text-red-500"
              />

              <label htmlFor="file" className="self-start">
                Imagen
              </label>
              <div className="w-full">
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 rounded-md outline-none focus-within:ring-1 focus-within:ring-[#FED0BB] cursor-pointer"
                  onChange={(e) => {
                    const selectedFile = e.currentTarget.files?.[0];
                    if (selectedFile) {
                      setFieldValue("file", selectedFile);
                      setPreviewUrl(URL.createObjectURL(selectedFile));
                    }
                  }}
                />
                {previewUrl && (
                  <div className="flex justify-center w-full mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="object-cover h-32 border border-gray-200 rounded-md"
                    />
                  </div>
                )}
              </div>
              <ErrorMessage
                name="file"
                component="div"
                className="self-start text-red-500"
              />

              <label htmlFor="categoryId" className="self-start"></label>

              <label htmlFor="categoryId" className="self-start">
                Categoria
              </label>
              <div className="flex items-center w-full border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-[#FED0BB]">
                <Field
                  id="categoryId"
                  name="categoryId"
                  as="select"
                  className="w-full p-2 outline-none"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Field>
              </div>
              <ErrorMessage
                name="categoryId"
                component="div"
                className="self-start text-red-500"
              />

              <label htmlFor="stock" className="self-start">
                Stock
              </label>
              <div className="flex items-center w-full border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-[#FED0BB]">
                <Field
                  id="stock"
                  type="number"
                  name="stock"
                  placeholder="10"
                  className="w-full p-2 outline-none"
                />
              </div>
              <ErrorMessage
                name="stock"
                component="div"
                className="self-start text-red-500"
              />
              <label htmlFor="type" className="self-start">
                Tipo de producto
              </label>
              <div className="flex items-center w-full border border-gray-300 rounded-md focus-within:ring-1 mb-3 focus-within:ring-[#FED0BB]">
                <Field
                  id="type"
                  name="type"
                  as="select"
                  className="w-full p-2 outline-none"
                >
                  <option value="">Selecciona un tipo</option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.name}
                    </option>
                  ))}
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="relative overflow-hidden w-full py-2 bg-linear-to-r from-[#3d0c07] to-[#56070C] text-white font-semibold rounded-lg shadow-lg transition duration-300 group cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "Guardando..." : "Subir producto"}
                <span className="absolute inset-0 transition-transform -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full duration-1500"></span>
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PlateForm;
