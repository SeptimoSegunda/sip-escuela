"use client";

import React from "react";
import Link from "next/link";
import styles from "@/components/book-cards/book-cards.module.css";
import { CardEditorial } from "@/components/book-cards/CardEditorial";
import { CardMuseo } from "@/components/book-cards/CardMuseo";
import { CardFicha } from "@/components/book-cards/CardFicha";
import { CardPoster } from "@/components/book-cards/CardPoster";
import { CardFlip } from "@/components/book-cards/CardFlip";

export default function TarjetasPage() {
  const edBooks = [
    { title: "La casa del viento", author: "Adela Quiroga", genre: "Novela", seed: 11 },
    { title: "Cuadernos de sal", author: "Tomás Beiro", genre: "Poesía", seed: 22 },
    { title: "El mapa interior", author: "Nadia Ferreyra", genre: "Ensayo", seed: 33 }
  ];

  const muBooks = [
    { title: "Retrato de un silencio", author: "Ilse Marconi", catNo: "CAT. 041", seed: 44 },
    { title: "Los jardines ausentes", author: "Rubén Castex", catNo: "CAT. 042", seed: 55 },
    { title: "Tratado de la niebla", author: "Marina Voss", catNo: "CAT. 043", seed: 66 }
  ];

  const libBooks = [
    { title: "El cifrado de medianoche", author: "H. R. Solari", genre: "Misterio", year: "1998", sig: "MIS-114", status: "DISPONIBLE", seed: 77 },
    { title: "Crónica de las mareas", author: "Alejo Nervi", genre: "Aventura", year: "1987", sig: "AVT-052", status: "PRESTADO", seed: 88 },
    { title: "Manual del insomnio", author: "Celia Andrade", genre: "No ficción", year: "2005", sig: "NF-231", status: "DISPONIBLE", seed: 99 }
  ];

  const poBooks = [
    { title: "Sangre y ceniza", author: "V. Roldán", ribbon: "Thriller", seed: 110 },
    { title: "La última llamada", author: "D. Ferro", ribbon: "Policial", seed: 121 },
    { title: "Noctámbulos", author: "K. Lombardi", ribbon: "Terror", seed: 132 }
  ];

  const flBooks = [
    {
      title: "Todo lo que brilla se rompe",
      author: "Sol Manrique",
      stars: 4,
      tags: ["Romance", "Contemporánea"],
      synopsis: "Dos hermanas heredan una casa de verano y con ella, todo lo que dejaron sin decirse.",
      seed: 140
    },
    {
      title: "El club de los jueves",
      author: "Iván Petrakis",
      stars: 5,
      tags: ["Ficción", "Coral"],
      synopsis: "Cinco vecinos, un edificio a punto de venderse y una promesa que nadie quiere romper primero.",
      seed: 151
    },
    {
      title: "Segundas primaveras",
      author: "Lucía Beltrán",
      stars: 4,
      tags: ["Drama", "Familia"],
      synopsis: "Volver al pueblo a los cuarenta significa encontrarse con quien una vez decidió irse.",
      seed: 162
    }
  ];

  return (
    <div className={styles.cardsPage}>
      {/* Navegación institucional */}
      <header className={styles.topNav}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" className={styles.backBtn}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i> Dashboard
          </Link>
          <span className={styles.topNavBrand}>SIP · Galería de Tarjetas</span>
        </div>

        <nav className={styles.topNavLinks}>
          <Link href="/hero" className={styles.topNavLink}>Presentación</Link>
          <Link href="/perfil" className={styles.topNavLink}>Mi Perfil</Link>
        </nav>
      </header>

      {/* Introducción */}
      <div className={styles.intro}>
        <div className={styles.kicker}>Componente · Tarjeta de libro</div>
        <h1 className={styles.introTitle}>Cinco formas de mostrar portada y título</h1>
        <p className={styles.introDesc}>
          Cada dirección usa su propia paleta y tipografía — elegí la que mejor se lleve con el resto de tu web o combinalas según la sección.
        </p>
      </div>

      {/* 01 Editorial Clásica */}
      <section className={`${styles.showcase} ${styles.showcaseEd}`}>
        <div className={styles.showcaseInner}>
          <div className={styles.showcaseHead}>
            <div className={styles.showcaseNum}>01 — Editorial clásica</div>
            <h2 className={styles.showcaseTitle}>Sobria, tipo librería boutique</h2>
            <p className={styles.showcaseDesc}>
              Portada al frente, una línea dorada como respiro y el título en itálica serif. Ideal para narrativa y poesía.
            </p>
          </div>
          <div className={styles.cardsRow}>
            {edBooks.map((b) => (
              <CardEditorial key={b.title} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* 02 Placa de Galería */}
      <section className={`${styles.showcase} ${styles.showcaseMu}`}>
        <div className={styles.showcaseInner}>
          <div className={styles.showcaseHead}>
            <div className={styles.showcaseNum}>02 — Placa de galería</div>
            <h2 className={styles.showcaseTitle}>La portada como una obra enmarcada</h2>
            <p className={styles.showcaseDesc}>
              Un passe-partout beige rodea la portada y una placa tipo museo la identifica debajo, con su número de catálogo.
            </p>
          </div>
          <div className={styles.cardsRow}>
            {muBooks.map((b) => (
              <CardMuseo key={b.title} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* 03 Ficha de Biblioteca */}
      <section className={`${styles.showcase} ${styles.showcaseLib}`}>
        <div className={styles.showcaseInner}>
          <div className={styles.showcaseHead}>
            <div className={styles.showcaseNum}>03 — Ficha de biblioteca</div>
            <h2 className={styles.showcaseTitle}>La vieja tarjeta de catálogo, digital</h2>
            <p className={styles.showcaseDesc}>
              Portada en miniatura y datos a máquina de escribir, con un sello de disponibilidad. Ideal para fichas o búsquedas densas.
            </p>
          </div>
          <div className={styles.cardsRow}>
            {libBooks.map((b) => (
              <CardFicha key={b.title} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* 04 Afiche Pulp */}
      <section className={`${styles.showcase} ${styles.showcasePo}`}>
        <div className={styles.showcaseInner}>
          <div className={styles.showcaseHead}>
            <div className={styles.showcaseNum}>04 — Afiche pulp</div>
            <h2 className={styles.showcaseTitle}>La portada ocupa todo, el título grita</h2>
            <p className={styles.showcaseDesc}>
              Fondo oxblood, cinta de género en diagonal y tipografía condensada enorme sobre la imagen. Pensada para suspenso y ficción.
            </p>
          </div>
          <div className={styles.cardsRow}>
            {poBooks.map((b) => (
              <CardPoster key={b.title} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* 05 Flip Interactiva */}
      <section className={`${styles.showcase} ${styles.showcaseFl}`}>
        <div className={styles.showcaseInner}>
          <div className={styles.showcaseHead}>
            <div className={styles.showcaseNum}>05 — Flip interactiva</div>
            <h2 className={styles.showcaseTitle}>Tocá la tarjeta y aparece la reseña</h2>
            <p className={styles.showcaseDesc}>
              Al hacer clic o presionar Enter, la tarjeta gira en 3D y muestra sinopsis, estrellas de valoración y etiquetas temáticas.
            </p>
          </div>
          <div className={styles.cardsRow}>
            {flBooks.map((b) => (
              <CardFlip key={b.title} {...b} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
