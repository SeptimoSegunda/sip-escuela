"use client";

import React from "react";
import styles from "./book-cards.module.css";
import { coverSVG } from "@/lib/proceduralCovers";

interface CardEditorialProps {
  title: string;
  author: string;
  genre: string;
  seed: number;
}

export const CardEditorial: React.FC<CardEditorialProps> = ({ title, author, genre, seed }) => {
  const bg = coverSVG(seed, ["#F1E9DA", "#B5673A", "#5C6E52"]);

  return (
    <div className={styles.cardEd}>
      <div className={styles.cover} style={{ backgroundImage: bg }}></div>
      <div className={styles.rule}></div>
      <div className={styles.meta}>
        <div className={styles.genre}>{genre}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.author}>{author}</div>
      </div>
    </div>
  );
};
