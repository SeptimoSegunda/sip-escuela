"use client";

import React, { useState } from "react";
import styles from "./perfil.module.css";

interface FavoritosManagerProps {
  favoritos: string[];
  onFavoritosChange: (nuevosFavs: string[]) => void;
}

export const FavoritosManager: React.FC<FavoritosManagerProps> = ({
  favoritos,
  onFavoritosChange
}) => {
  const [nuevoFav, setNuevoFav] = useState("");

  const handleAdd = () => {
    const valor = nuevoFav.trim();
    if (!valor || favoritos.includes(valor)) {
      setNuevoFav("");
      return;
    }
    const actualizados = [...favoritos, valor];
    onFavoritosChange(actualizados);
    setNuevoFav("");
  };

  const handleRemove = (index: number) => {
    const actualizados = favoritos.filter((_, i) => i !== index);
    onFavoritosChange(actualizados);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <section className={styles.seccion}>
      <h3>
        Estantería de favoritos{" "}
        <span className={styles.opcionalTag}>opcional</span>
      </h3>

      <div className={styles.chips}>
        {favoritos.length === 0 ? (
          <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontStyle: "italic" }}>
            Añadí tus temas o géneros favoritos abajo.
          </span>
        ) : (
          favoritos.map((fav, i) => (
            <span key={`${fav}-${i}`} className={styles.chip}>
              <span>{fav}</span>
              <button
                type="button"
                aria-label={`Quitar ${fav}`}
                onClick={() => handleRemove(i)}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      <div className={styles.addFav}>
        <input
          type="text"
          placeholder="Ej: Ciencia ficción, Novela histórica..."
          maxLength={24}
          value={nuevoFav}
          aria-label="Añadir género o tema favorito"
          onChange={(e) => setNuevoFav(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={handleAdd}>
          + Añadir
        </button>
      </div>
    </section>
  );
};
