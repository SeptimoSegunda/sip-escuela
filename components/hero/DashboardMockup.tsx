"use client";

import React from "react";
import Link from "next/link";
import styles from "./hero.module.css";

export const DashboardMockup: React.FC = () => {
  return (
    <div className={styles.mockupContainer}>
      <div className={styles.mockupWindowBar}>
        <span className={`${styles.mockupDot} ${styles.dotRed}`}></span>
        <span className={`${styles.mockupDot} ${styles.dotYellow}`}></span>
        <span className={`${styles.mockupDot} ${styles.dotGreen}`}></span>
        <span className={styles.mockupUrlBar}>https://biblioteca-sip.edu.ar/dashboard</span>
      </div>

      <div className={styles.mockupBody}>
        <div className={styles.mockupMiniHeader}>
          <div className={styles.mockupMiniLogo}>
            <i className="fa-solid fa-book-open" aria-hidden="true"></i> SIP Dashboard
          </div>
          <span className={styles.mockupMiniTag}>En Tiempo Real</span>
        </div>

        <div className={styles.mockupStatsRow}>
          <div className={styles.mockupStatCard}>
            <div className={styles.mockupStatVal}>17</div>
            <div className={styles.mockupStatLbl}>Ejemplares Físicos</div>
          </div>
          <div className={styles.mockupStatCard}>
            <div className={styles.mockupStatVal} style={{ color: "#D9A08B" }}>2</div>
            <div className={styles.mockupStatLbl}>Préstamos Activos</div>
          </div>
          <div className={styles.mockupStatCard}>
            <div className={styles.mockupStatVal} style={{ color: "#C78942" }}>3</div>
            <div className={styles.mockupStatLbl}>Socios Registrados</div>
          </div>
        </div>

        <div className={styles.mockupPreviewTable}>
          <div className={styles.mockupRow}>
            <span className={styles.mockupRowTitle}>Cien Años de Soledad</span>
            <span className={styles.mockupBadgeDisp}>3 disp.</span>
          </div>
          <div className={styles.mockupRow}>
            <span className={styles.mockupRowTitle}>Don Quijote de la Mancha</span>
            <span className={styles.mockupBadgeDisp}>5 disp.</span>
          </div>
          <div className={styles.mockupRow}>
            <span className={styles.mockupRowTitle}>Ficciones</span>
            <span className={styles.mockupBadgeDisp}>4 disp.</span>
          </div>
        </div>

        <Link
          href="/"
          className={styles.btn}
          style={{
            backgroundColor: "#5C4A3E",
            color: "#fff",
            padding: "0.6rem 1rem",
            fontSize: "0.85rem",
            borderRadius: "6px",
            textAlign: "center"
          }}
        >
          Abrir Sistema Interactivo →
        </Link>
      </div>
    </div>
  );
};
