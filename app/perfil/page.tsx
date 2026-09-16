"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/components/perfil/perfil.module.css";
import { AvatarUpload } from "@/components/perfil/AvatarUpload";
import { DescripcionForm } from "@/components/perfil/DescripcionForm";
import { FavoritosManager } from "@/components/perfil/FavoritosManager";
import { SelloEstado } from "@/components/perfil/SelloEstado";

const STORAGE_KEY = "biblioteca_perfil_usuario";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92">' +
      '<rect width="92" height="92" fill="#1F3A2E"/>' +
      '<circle cx="46" cy="36" r="16" fill="#F3ECD9"/>' +
      '<path d="M14 84c4-20 22-30 32-30s28 10 32 30" fill="#F3ECD9"/>' +
      '</svg>'
  );

interface ProfileData {
  nombre: string;
  fotoBase64: string;
  descripcion: string;
  favoritos: string[];
  socioDesde: string;
  ultimaActualizacion: string | null;
}

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<ProfileData>({
    nombre: "Socio de Biblioteca",
    fotoBase64: DEFAULT_AVATAR,
    descripcion: "",
    favoritos: ["Ficción", "Historia"],
    socioDesde: "Socio desde 2024",
    ultimaActualizacion: null
  });

  const [triggerPulse, setTriggerPulse] = useState(0);
  const [fichaNum, setFichaNum] = useState("N.º —");

  useEffect(() => {
    // Leer localStorage al montar en cliente
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPerfil((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Error al cargar perfil de localStorage:", e);
    }

    // Número de ficha determinista
    const hash = 74819; // Hash clásico de la biblioteca
    setFichaNum(`N.º ${String(hash).padStart(5, "0")}`);
  }, []);

  const savePerfil = (updated: Partial<ProfileData>) => {
    const nextState: ProfileData = {
      ...perfil,
      ...updated,
      ultimaActualizacion: new Date().toISOString()
    };
    setPerfil(nextState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (e) {
      console.error("Error al guardar perfil:", e);
    }
    setTriggerPulse((prev) => prev + 1);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Barra superior institucional */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Link href="/" className={styles.backButton}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Dashboard
          </Link>
          <span className={styles.topbarBrand}>Biblioteca Municipal SIP</span>
        </div>
        <span className={styles.topbarModule}>SISTEMA DE SOCIOS · MÓDULO PERFIL</span>
      </header>

      <main className={styles.card}>
        <div className={styles.cardInner}>
          <div className={styles.fichaHeader}>
            <h1>Ficha de Usuario</h1>
            <span className={styles.fichaNum}>{fichaNum}</span>
          </div>

          <div className={styles.perfilTop}>
            <AvatarUpload
              fotoSrc={perfil.fotoBase64 || DEFAULT_AVATAR}
              onFotoChange={(base64) => savePerfil({ fotoBase64: base64 })}
            />
            <div className={styles.perfilMeta}>
              <h2>{perfil.nombre}</h2>
              <p>{perfil.socioDesde}</p>
            </div>
          </div>

          <DescripcionForm
            descripcionInicial={perfil.descripcion}
            onGuardar={(nuevaDesc) => savePerfil({ descripcion: nuevaDesc })}
          />

          <FavoritosManager
            favoritos={perfil.favoritos}
            onFavoritosChange={(nuevosFavs) => savePerfil({ favoritos: nuevosFavs })}
          />

          <SelloEstado
            ultimaActualizacion={perfil.ultimaActualizacion}
            triggerPulse={triggerPulse}
          />
        </div>
      </main>
    </div>
  );
}
