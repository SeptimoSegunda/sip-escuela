"use client";

import React, { useState } from "react";
import styles from "./book-cards.module.css";
import { coverSVG } from "@/lib/proceduralCovers";

interface CardFlipProps {
  title: string;
  author: string;
  stars: number;
  tags: string[];
  synopsis: string;
  seed: number;
}

export const CardFlip: React.FC<CardFlipProps> = ({
  title,
  author,
  stars,
  tags,
  synopsis,
  seed
}) => {
  const [flipped, setFlipped] = useState(false);
  const bg = coverSVG(seed, ["#EDE0F7", "#8E7BC7", "#D98A4C"]);

  const toggle = () => setFlipped(!flipped);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      className={`${styles.flipCard} ${flipped ? styles.isFlipped : ""}`}
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      title="Tocar para voltear tarjeta"
    >
      <div className={styles.flipInner}>
        <div className={`${styles.flipFace} ${styles.flipFront}`}>
          <div className={styles.cover} style={{ backgroundImage: bg }}></div>
          <div className={styles.tapHint}>↻</div>
          <div className={styles.pill}>
            <div className={styles.title}>{title}</div>
            <div className={styles.author}>{author}</div>
          </div>
        </div>

        <div className={`${styles.flipFace} ${styles.flipBack}`}>
          <div className={styles.title}>{title}</div>
          <div className={styles.stars}>
            {"★".repeat(stars)}
            {"☆".repeat(Math.max(0, 5 - stars))}
          </div>
          <div className={styles.synopsis}>{synopsis}</div>
          <div className={styles.tags}>
            {tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>
          <button className={styles.cta} type="button" onClick={(e) => e.stopPropagation()}>
            Ver Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
