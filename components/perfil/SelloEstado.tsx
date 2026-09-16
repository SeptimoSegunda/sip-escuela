"use client";

import React, { useEffect, useState } from "react";
import styles from "./perfil.module.css";

interface SelloEstadoProps {
  ultimaActualizacion: string | null;
  triggerPulse: number;
}

export const SelloEstado: React.FC<SelloEstadoProps> = ({
  ultimaActualizacion,
  triggerPulse
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (triggerPulse > 0) {
      setPulse(false);
      const timer = setTimeout(() => setPulse(true), 20);
      return () => clearTimeout(timer);
    }
  }, [triggerPulse]);

  const textoFecha = () => {
    if (!ultimaActualizacion) return "Sin guardar aún";
    const d = new Date(ultimaActualizacion);
    return (
      "Actualizado: " +
      d.toLocaleDateString("es-AR") +
      " " +
      d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className={styles.selloWrap}>
      <div
        className={`${styles.sello} ${pulse ? styles.selloPulse : ""}`}
        role="status"
        aria-live="polite"
      >
        {textoFecha()}
      </div>
    </div>
  );
};
