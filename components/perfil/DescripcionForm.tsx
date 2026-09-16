"use client";

import React, { useState, useEffect } from "react";
import styles from "./perfil.module.css";

interface DescripcionFormProps {
  descripcionInicial: string;
  onGuardar: (nuevaDescripcion: string) => void;
}

export const DescripcionForm: React.FC<DescripcionFormProps> = ({
  descripcionInicial,
  onGuardar
}) => {
  const [texto, setTexto] = useState(descripcionInicial);

  useEffect(() => {
    setTexto(descripcionInicial);
  }, [descripcionInicial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(texto.trim());
  };

  return (
    <section className={styles.seccion}>
      <h3>Sobre mí</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={texto}
          maxLength={280}
          placeholder="Contá algo sobre vos: qué te gusta leer, qué buscás en la biblioteca..."
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className={styles.rowBetween}>
          <span className={styles.contador}>
            <span>{texto.length}</span>/280
          </span>
          <button type="submit" className={styles.principal}>
            Guardar cambios
          </button>
        </div>
      </form>
    </section>
  );
};
