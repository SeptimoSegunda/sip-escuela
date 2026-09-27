"use client";

import React from "react";
import { useApp } from "@/store/AppContext";
import { AuditLog } from "@/lib/types";

const CATEGORIA_ICONS: Record<AuditLog["categoria"], string> = {
  Libros: "fa-solid fa-book",
  Préstamos: "fa-solid fa-repeat",
  Socios: "fa-solid fa-users",
  Daños: "fa-solid fa-triangle-exclamation",
  Sistema: "fa-solid fa-gear",
};

const CATEGORIA_COLORS: Record<AuditLog["categoria"], string> = {
  Libros: "#6B7FD7",
  Préstamos: "#5C9E7B",
  Socios: "#E8A838",
  Daños: "#DC2626",
  Sistema: "#6B7280",
};

export const ViewAuditoria: React.FC = () => {
  const { auditLogs } = useApp();
  const [filtroAdmin, setFiltroAdmin] = React.useState("all");
  const [filtroCategoria, setFiltroCategoria] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const statTotal = auditLogs.length;
  const statManana = auditLogs.filter((l) => l.administrador === "Turno Mañana").length;
  const statTarde = auditLogs.filter((l) => l.administrador === "Turno Tarde").length;

  const filtrado = auditLogs.filter((l) => {
    if (filtroAdmin !== "all" && l.administrador !== filtroAdmin) return false;
    if (filtroCategoria !== "all" && l.categoria !== filtroCategoria) return false;
    if (
      search &&
      !l.accion.toLowerCase().includes(search.toLowerCase()) &&
      !l.descripcion.toLowerCase().includes(search.toLowerCase()) &&
      !l.administrador.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div id="viewAuditoria" className="view-section active-view">
      <section className="welcome-section">
        <div className="welcome-text">
          <h1>Bitácora de Auditoría y Acciones</h1>
          <p>
            Registro cronológico de todas las acciones, adiciones y cambios realizados por los
            administradores.
          </p>
        </div>
      </section>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon metric-icon--salvia">
            <i className="fa-solid fa-list-check"></i>
          </div>
          <div className="metric-data">
            <h3>{statTotal}</h3>
            <p>Total de Acciones</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon metric-icon--mustard">
            <i className="fa-solid fa-sun"></i>
          </div>
          <div className="metric-data">
            <h3>{statManana}</h3>
            <p>Acciones Turno Mañana</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon metric-icon--terracotta">
            <i className="fa-solid fa-cloud-sun"></i>
          </div>
          <div className="metric-data">
            <h3>{statTarde}</h3>
            <p>Acciones Turno Tarde</p>
          </div>
        </div>
      </section>

      <section className="catalog-section">
        <div className="section-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--beige-dark)",
                borderRadius: "8px",
                padding: "0.3rem 0.7rem",
              }}
            >
              <label
                htmlFor="selectAuditAdminFilter"
                style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-brown)" }}
              >
                <i className="fa-solid fa-user-shield"></i> Turno:
              </label>
              <select
                id="selectAuditAdminFilter"
                value={filtroAdmin}
                onChange={(e) => setFiltroAdmin(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <option value="all">Todos los Turnos</option>
                <option value="Turno Mañana">Turno Mañana</option>
                <option value="Turno Tarde">Turno Tarde</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--bg-surface)",
                border: "1px solid var(--beige-dark)",
                borderRadius: "8px",
                padding: "0.3rem 0.7rem",
              }}
            >
              <label
                htmlFor="selectAuditCategoryFilter"
                style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-brown)" }}
              >
                <i className="fa-solid fa-filter"></i> Categoría:
              </label>
              <select
                id="selectAuditCategoryFilter"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <option value="all">Todas las Categorías</option>
                <option value="Libros">Catálogo de Libros</option>
                <option value="Préstamos">Gestión de Préstamos</option>
                <option value="Socios">Sujetos Educativos</option>
                <option value="Daños">Control de Daños</option>
                <option value="Sistema">Actividad del Sistema</option>
              </select>
            </div>
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
              id="auditSearchInput"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en la bitácora..."
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
            <i className="fa-solid fa-clipboard-list" style={{ fontSize: "2.5rem", marginBottom: "0.6rem", display: "block" }}></i>
            <p style={{ fontWeight: 600 }}>Sin acciones registradas todavía.</p>
            <span style={{ fontSize: "0.85rem" }}>Las acciones del sistema aparecerán aquí automáticamente.</span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Administrador</th>
                <th>Categoría</th>
                <th>Acción</th>
                <th>Descripción y Detalles del Cambio</th>
              </tr>
            </thead>
            <tbody>
              {filtrado.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>{log.fechaHora}</td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <i
                        className={log.administrador === "Turno Mañana" ? "fa-solid fa-sun" : "fa-solid fa-cloud-sun"}
                        style={{ color: log.administrador === "Turno Mañana" ? "#E8A838" : "#6B7FD7" }}
                      ></i>
                      {log.administrador}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: CATEGORIA_COLORS[log.categoria],
                      }}
                    >
                      <i className={CATEGORIA_ICONS[log.categoria]}></i>
                      {log.categoria}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: "0.85rem" }}>{log.accion}</td>
                  <td style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>{log.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
