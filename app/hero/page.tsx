"use client";

import React from "react";
import Link from "next/link";
import styles from "@/components/hero/hero.module.css";
import { HeroHeader } from "@/components/hero/HeroHeader";
import { DashboardMockup } from "@/components/hero/DashboardMockup";
import { FeaturesSection } from "@/components/hero/FeaturesSection";

export default function HeroPage() {
  return (
    <div className={styles.heroPage}>
      <HeroHeader />

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>
            <i className="fa-solid fa-graduation-cap" aria-hidden="true"></i>
            Gestión Escolar Integrada
          </span>

          <h1 className={styles.heroTitle}>
            La biblioteca de tu escuela, <span>más accesible</span> que nunca.
          </h1>

          <p className={styles.heroSubtitle}>
            Gestiona préstamos, automatiza devoluciones y permite que alumnos y docentes exploren el catálogo completo desde cualquier dispositivo.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/" className={`${styles.btn} ${styles.btnPrimary}`}>
              <i className="fa-solid fa-book" aria-hidden="true"></i> Explorar Catálogo
            </Link>
            <a href="#como-funciona" className={`${styles.btn} ${styles.btnSecondary}`}>
              <i className="fa-solid fa-circle-info" aria-hidden="true"></i> Ver cómo funciona
            </a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <DashboardMockup />
        </div>
      </section>

      <FeaturesSection />

      <footer className={styles.heroFooter}>
        <div className={styles.footerContent}>
          <p>&copy; 2026 Sistema SIP — Proyecto Escolar de Biblioteca</p>
          <div className={styles.footerLinks}>
            <Link href="/">Dashboard</Link>
            <Link href="/perfil">Ficha de Usuario</Link>
            <a href="#como-funciona">Características</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
