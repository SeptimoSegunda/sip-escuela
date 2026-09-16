"use client";

import React from "react";
import styles from "./book-cards.module.css";
import { coverSVG } from "@/lib/proceduralCovers";

interface CardMuseoProps {
  title: string;
  author: string;
  catNo: string;
  seed: number;
}

export const CardMuseo: React.FC<CardMuseoProps> = ({ title, author, catNo, seed }) => {
  const bg = coverSVG(seed, ["#EFE7D6", "#8C6B3D", "#4E5E52"]);

  return (
    <div className={styles.cardMu}>
      <div className={styles.frame}>
        <div className={styles.cover} style={{ backgroundImage: bg }}></div>
      </div>
      <div className={styles.plate}>
        <div className={styles.title}>{title}</div>
        <div className={styles.author}>{author}</div>
        <div className={styles.catno}>{catNo}</div>
      </div>
    </div>
  );
};
