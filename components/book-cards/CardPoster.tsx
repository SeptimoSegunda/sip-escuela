"use client";

import React from "react";
import styles from "./book-cards.module.css";
import { coverSVG } from "@/lib/proceduralCovers";

interface CardPosterProps {
  title: string;
  author: string;
  ribbon: string;
  seed: number;
}

export const CardPoster: React.FC<CardPosterProps> = ({ title, author, ribbon, seed }) => {
  const bg = coverSVG(seed, ["#4A1620", "#7A2430", "#D9A94C"]);

  return (
    <div className={styles.cardPo}>
      <div className={styles.cover} style={{ backgroundImage: bg }}></div>
      <div className={styles.scrim}></div>
      <div className={styles.ribbon}>{ribbon}</div>
      <div className={styles.meta}>
        <div className={styles.title}>{title}</div>
        <div className={styles.author}>{author}</div>
      </div>
    </div>
  );
};
