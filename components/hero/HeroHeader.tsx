"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./hero.module.css";

export const HeroHeader: React.FC = () => {
  return (
    <header className={styles.headerNav}>
      <Link href="/hero" className={styles.brandLogo}>
        <Image
          src="/logo.png"
          alt="Logo SIP"
          width={42}
          height={42}
          priority
        />
        <div className={styles.brandTitleGroup}>
          <span className={styles.brandTitle}>SIP</span>
          <span className={styles.brandSubtitle}>Sistema de Préstamos Escolares</span>
        </div>
      </Link>

      <nav className={styles.navLinks}>
        <Link href="/" className={`${styles.navLink} ${styles.navBtnPrimary}`}>
          <i className="fa-solid fa-gauge" aria-hidden="true"></i> Ir al Dashboard
        </Link>
        <Link href="/perfil" className={styles.navLink}>
          <i className="fa-solid fa-id-card" aria-hidden="true"></i> Mi Perfil
        </Link>
      </nav>
    </header>
  );
};
