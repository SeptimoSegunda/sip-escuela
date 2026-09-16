"use client";

import React from "react";
import styles from "./book-cards.module.css";
import { coverSVG } from "@/lib/proceduralCovers";

interface CardFichaProps {
  title: string;
  author: string;
  genre: string;
  year: string;
  sig: string;
  status: string;
  seed: number;
}

export const CardFicha: React.FC<CardFichaProps> = ({
  title,
  author,
  genre,
  year,
  sig,
  status,
  seed
}) => {
  const bg = coverSVG(seed, ["#F3E7C4", "#A13D2B", "#26364A"]);

  return (
    <div className={styles.cardLib}>
      <div className={styles.cover} style={{ backgroundImage: bg }}></div>
      <div className={styles.fields}>
        <div className={styles.row}>
          <span className={styles.k}>TÍTULO</span>
          <span className={`${styles.v} ${styles.titleV}`}>{title}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.k}>AUTOR/A</span>
          <span className={styles.v}>{author}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.k}>GÉNERO</span>
          <span className={styles.v}>{genre}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.k}>AÑO</span>
          <span className={styles.v}>{year}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.k}>SIGNATURA</span>
          <span className={styles.v}>{sig}</span>
        </div>
      </div>
      <div className={styles.stamp}>{status}</div>
    </div>
  );
};
