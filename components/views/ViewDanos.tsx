"use client";

import React from "react";
import { useApp } from "@/store/AppContext";
import { Dano, NivelDano } from "@/lib/types";

const NIVEL_CONFIG: Record<NivelDano, { badge: string; className: string }> = {
  "Daño leve": { badge: "🟢 Leve", className: "badge-available" },
  "Daño moderado": { badge: "🟠 Moderado", className: "badge-overdue" },
  "CATASTROFICO!": { badge: "🔴 CATASTRÓFICO", className: "badge-lost" },
};

interface SocioConDanos {
  socioId: string;
  socioNombre: string;
  danos: Dano[];
  totalIncidencias: number;
  severidadMax: NivelDano;
  leves: number;
  moderados: number;
  catastroficos: number;
}

export const ViewDanos: React.FC = () => {
  const { danos, openModal } = useApp();
  const [filtro, setFiltro] = React.useState<"all" | "criticos">("all");
  const [search, setSearch] = React.useState("");

  // Agrupar daños por socio
  const porSocio = React.useMemo<SocioConDanos[]>(() => {
    const map = new Map<string, SocioConDanos>();
    danos.forEach((d) => {
      if (!map.has(d.socioId)) {
        map.set(d.socioId, {
          socioId: d.socioId,
          socioNombre: d.socioNombre,
          danos: [],
          totalIncidencias: 0,
          severidadMax: "Daño leve",
          leves: 0,
          moderados: 0,
          catastroficos: 0,
        });
      }
      const entry = map.get(d.socioId)!;
      entry.danos.push(d);
      entry.totalIncidencias++;
      if (d.nivelDano === "CATASTROFICO!") {
        entry.catastroficos++;
        entry.severidadMax = "CATASTROFICO!";
      } else if (d.nivelDano === "Daño moderado") {
        entry.moderados++;
        if (entry.severidadMax !== "CATASTROFICO!") entry.severidadMax = "Daño moderado";
      } else {
        entry.leves++;
      }
    });
    return Array.from(map.values());
  }, [danos]);

  const filtrado = porSocio
    .filter((s) => filtro === "all" || s.catastroficos > 0 || s.severidadMax === "CATASTROFICO!")
    .filter((s) =>
      search === "" ||
      s.socioNombre.toLowerCase().includes(search.toLowerCase()) ||
      s.socioId.toLowerCase().includes(search.toLowerCase())
    );

  const statTotal = danos.length;
  const statSociosConDanos = porSocio.length;
  const statLeves = danos.filter((d) => d.nivelDano === "Daño leve").length;
  const statModerados = danos.filter((d) => d.nivelDano === "Daño moderado").length;
  const statCatastroficos = danos.filter((d) => d.nivelDano === "CATASTROFICO!").length;

  return (
    <div id="viewDanos" className="view-section active-view">
      <section className="welcome-section">
        <div className="welcome-text">
          <h1>
            <i className="fa-solid fa-triangle-exclamation"></i> Registro y Control de Daños
          </h1>
          <p>
            Seguimiento exclusivo de ejemplares deteriorados e historial disciplinario de alumnos con
            incidencias registradas.
          </p>
        </div>
        <button className="btn-primary" onClick={() => openModal("nuevoDano")}>
          <i className="fa-solid fa-triangle-exclamation"></i> Registrar Daño Manual
        </button>
      </section>

      <section
        className="metrics-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        <div className="metric-card">
          <div className="metric-icon metric-icon--mustard">
            <i className="fa-solid fa-file-circle-exclamation"></i>
          </div>
          <div className="metric-data">
            <h3>{statTotal}</h3>
            <p>Total Incidencias</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
            <i className="fa-solid fa-user-xmark"></i>
          </div>
          <div className="metric-data">
            <h3>{statSociosConDanos}</h3>
            <p>Alumnos con Daños</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon metric-icon--salvia">
            <i className="fa-solid fa-leaf"></i>
          </div>
          <div className="metric-data">
            <h3>{statLeves}</h3>
            <p>Daño Leve</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon metric-icon--terracotta">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="metric-data">
            <h3>{statModerados}</h3>
            <p>Daño Moderado</p>
          </div>
        </div>

        <div className="metric-card" style={{ border: statCatastroficos > 0 ? "2px solid #DC2626" : undefined }}>
          <div className="metric-icon" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
            <i className="fa-solid fa-skull-crossbones"></i>
          </div>
          <div className="metric-data">
            <h3 style={{ color: "#DC2626" }}>{statCatastroficos}</h3>
            <p style={{ color: "#721C24", fontWeight: 700 }}>CATASTRÓFICO!</p>
          </div>
        </div>
      </section>

      <section className="catalog-section">
        <div className="section-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div className="loans-filter-bar" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className={`btn-filter ${filtro === "all" ? "active" : ""}`}
              onClick={() => setFiltro("all")}
            >
              <i className="fa-solid fa-list"></i> Todos con Daños
            </button>
            <button
              className={`btn-filter ${filtro === "criticos" ? "active" : ""}`}
              onClick={() => setFiltro("criticos")}
            >
              <i className="fa-solid fa-skull-crossbones"></i> Casos Críticos
            </button>
          </div>
          <div
            className="search-bar-catalog"
            style={{
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--beige-dark)",
              borderRadius: "20px",
              padding: "0.5rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              minWidth: "280px",
            }}
          >
            <i className="fa-solid fa-magnifying-glass" style={{ color: "var(--text-muted)" }}></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alumno con daño por nombre, ID o curso..."
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                color: "var(--text-main)",
                width: "100%",
                fontSize: "0.8rem",
              }}
            />
          </div>
        </div>

        {filtrado.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: "2.5rem", color: "#10B981", marginBottom: "0.6rem", display: "block" }}></i>
            <p style={{ fontWeight: 600, color: "#065F46" }}>Sin incidencias registradas.</p>
            <span style={{ fontSize: "0.85rem" }}>No hay daños registrados en el sistema.</span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><i className="fa-solid fa-id-badge"></i> ID Sujeto</th>
                <th><i className="fa-solid fa-user"></i> Apellido y Nombre</th>
                <th><i className="fa-solid fa-circle-exclamation"></i> Total Incidencias</th>
                <th><i className="fa-solid fa-gauge-high"></i> Severidad Máxima</th>
                <th><i className="fa-solid fa-chart-simple"></i> Desglose</th>
                <th><i className="fa-solid fa-gear"></i> Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrado.map((s) => {
                const cfg = NIVEL_CONFIG[s.severidadMax];
                return (
                  <tr key={s.socioId}>
                    <td><code style={{ fontSize: "0.8rem" }}>{s.socioId}</code></td>
                    <td style={{ fontWeight: 600 }}>{s.socioNombre}</td>
                    <td>
                      <span className="badge" style={{ background: "#F3F4F6", color: "var(--text-main)", fontWeight: 700 }}>
                        {s.totalIncidencias}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${cfg.className}`}>{cfg.badge}</span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      {s.leves > 0 && <span style={{ marginRight: "0.4rem" }}>🟢 {s.leves}</span>}
                      {s.moderados > 0 && <span style={{ marginRight: "0.4rem" }}>🟠 {s.moderados}</span>}
                      {s.catastroficos > 0 && <span>🔴 {s.catastroficos}</span>}
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: "0.8rem", padding: "0.35rem 0.7rem" }}
                        onClick={() => openModal("expedienteSocio", undefined, s.socioId)}
                      >
                        <i className="fa-solid fa-folder-open"></i> Ver Expediente
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
