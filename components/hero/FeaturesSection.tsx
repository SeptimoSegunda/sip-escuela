"use client";

import React from "react";
import styles from "./hero.module.css";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: "📚",
      title: "Control de Préstamos",
      description:
        "Registra salidas y devoluciones de libros en segundos con seguimiento riguroso de fechas límite y control de mora."
    },
    {
      icon: "🔍",
      title: "Catálogo Digital",
      description:
        "Búsqueda instantánea por autor, título, inventario o categoría visible para toda la comunidad escolar."
    },
    {
      icon: "📊",
      title: "Reportes Automáticos",
      description:
        "Genera estadísticas por mes, ranking de libros más solicitados y métricas de lectura por curso o nivel."
    }
  ];

  return (
    <section className={styles.featuresSection} id="como-funciona">
      <div className={styles.featuresContainer}>
        <div className={styles.featuresHeader}>
          <h2>Todo lo que tu escuela necesita en un solo lugar</h2>
          <p>Herramientas diseñadas para facilitar el trabajo diario de bibliotecarios, docentes y alumnos.</p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <article key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
