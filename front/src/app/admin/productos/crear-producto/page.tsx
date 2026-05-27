"use client";
import PlateForm from "@/components/admin/PlateForm";
import Navbar from "@/components/NavBar";
import Sidebar from "@/components/admin/Sidebar";
import { useState } from "react";

const CreatePlatePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen mt-20 w-full bg-[#F6E3D9] flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1">
          <PlateForm />
        </div>
      </div>
    </>
  );
};

export default CreatePlatePage;
