"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/store/AppContext";

export const Header: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <header className="dashboard-header">
      <div
        className="logo-container"
        id="logoHome"
        onClick={() => setActiveView("inicio")}
        role="button"
        tabIndex={0}
      >
        <Image
          src="/logo.png"
          alt="Logotipo SIP"
          width={40}
          height={40}
          className="logo-img"
          priority
        />
        <div className="logo-text-group">
          <span className="logo-text">SIP</span>
          <span className="logo-subtitle">Sistema de Préstamos Escolares</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
        <Link
          href="/hero"
          className="btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            textDecoration: "none",
            fontSize: "0.85rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "4px"
          }}
          title="Ver Página de Presentación"
        >
          <i className="fa-solid fa-compass" aria-hidden="true"></i>
          <span>Presentación</span>
        </Link>

        <Link
          href="/tarjetas"
          className="btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            textDecoration: "none",
            fontSize: "0.85rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "4px"
          }}
          title="Ver Diseños de Tarjetas"
        >
          <i className="fa-solid fa-layer-group" aria-hidden="true"></i>
          <span>Tarjetas</span>
        </Link>

        <Link
          href="/perfil"
          className="btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            textDecoration: "none",
            fontSize: "0.85rem",
            padding: "0.4rem 0.8rem",
            borderRadius: "4px"
          }}
          title="Ver Ficha de Usuario"
        >
          <i className="fa-solid fa-address-card" aria-hidden="true"></i>
          <span>Mi Perfil</span>
        </Link>
      </div>
    </header>
  );
};
