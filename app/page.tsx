"use client";

import React from "react";
import { useApp } from "@/store/AppContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";

import { ViewInicio } from "@/components/views/ViewInicio";
import { ViewCatalogo } from "@/components/views/ViewCatalogo";
import { ViewPrestamos } from "@/components/views/ViewPrestamos";
import { ViewSocios } from "@/components/views/ViewSocios";
import { ViewReportes } from "@/components/views/ViewReportes";

import { ModalPrestamo } from "@/components/modals/ModalPrestamo";
import { ModalDevolucion } from "@/components/modals/ModalDevolucion";
import { ModalSocio } from "@/components/modals/ModalSocio";
import { ModalNuevoLibro } from "@/components/modals/ModalNuevoLibro";
import { ModalDetalleLibro } from "@/components/modals/ModalDetalleLibro";

export default function DashboardPage() {
  const { activeView, activeModal } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case "inicio":
        return <ViewInicio />;
      case "catalogo":
        return <ViewCatalogo />;
      case "prestamos":
        return <ViewPrestamos />;
      case "socios":
        return <ViewSocios />;
      case "reportes":
        return <ViewReportes />;
      default:
        return <ViewInicio />;
    }
  };

  return (
    <>
      <Header />

      <main className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          {renderActiveView()}
        </div>
      </main>

      <Footer />

      {/* Modales del Dashboard */}
      {activeModal === "prestamo" && <ModalPrestamo />}
      {activeModal === "devolucion" && <ModalDevolucion />}
      {activeModal === "socio" && <ModalSocio />}
      {activeModal === "nuevoLibro" && <ModalNuevoLibro />}
      {activeModal === "detalleLibro" && <ModalDetalleLibro />}
    </>
  );
}
