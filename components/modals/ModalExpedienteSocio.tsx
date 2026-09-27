"use client";

import React from "react";
import { useApp } from "@/store/AppContext";
import { ModalWrapper } from "./ModalWrapper";
import { Dano, NivelDano } from "@/lib/types";

const NIVEL_CONFIG: Record<NivelDano, { badge: string; badgeClass: string }> = {
  "Daño leve": { badge: "🟢 Leve", badgeClass: "badge-available" },
  "Daño moderado": { badge: "🟠 Moderado", badgeClass: "badge-overdue" },
  "CATASTROFICO!": { badge: "🔴 CATASTRÓFICO", badgeClass: "badge-lost" },
};

export const ModalExpedienteSocio: React.FC = () => {
  const { socios, danos, selectedSocioId, closeModal } = useApp();

  const socio = socios.find((s) => s.id === selectedSocioId);
  const expediente: Dano[] = danos.filter((d) => d.socioId === selectedSocioId);

  const totalIncidencias = expediente.length;
  const leves = expediente.filter((d) => d.nivelDano === "Daño leve").length;
  const moderados = expediente.filter((d) => d.nivelDano === "Daño moderado").length;
  const catastroficos = expediente.filter((d) => d.nivelDano === "CATASTROFICO!").length;

  if (!socio) return null;

  return (
    <ModalWrapper
      id="modalExpedienteSocio"
      title="Expediente de Antecedentes e Incidencias"
      subtitle="Historial disciplinario centralizado y registro de daños atribuidos al sujeto educativo."
      isLarge
    >
      {/* Banner del socio */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--beige-anchor)",
          borderRadius: "10px",
          padding: "1rem 1.2rem",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--beige-anchor)",
            color: "var(--accent-brown)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            fontWeight: 700,
          }}
        >
          {socio.apellido[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--accent-brown)" }}>
            {socio.apellido}, {socio.nombre}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {socio.id} · {socio.tipo} · {socio.anio} {socio.turno}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {leves > 0 && (
            <span className="badge badge-available">🟢 {leves} leve{leves > 1 ? "s" : ""}</span>
          )}
          {moderados > 0 && (
            <span className="badge badge-overdue">🟠 {moderados} moderado{moderados > 1 ? "s" : ""}</span>
          )}
          {catastroficos > 0 && (
            <span className="badge badge-lost">🔴 {catastroficos} catastrófico{catastroficos > 1 ? "s" : ""}</span>
          )}
        </div>
      </div>

      {/* Historial */}
      <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.8rem",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              color: "var(--accent-brown)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="fa-solid fa-clock-rotate-left"></i> Historial Completo de Incidentes
          </h3>
          <span
            className="badge"
            style={{ background: "#F3F4F6", color: "var(--text-main)", fontWeight: 700 }}
          >
            {totalIncidencias} registro{totalIncidencias !== 1 ? "s" : ""}
          </span>
        </div>

        {expediente.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "var(--text-muted)",
              border: "1px solid var(--beige-anchor)",
              borderRadius: "8px",
            }}
          >
            <i
              className="fa-solid fa-circle-check"
              style={{ fontSize: "2.5rem", color: "#10B981", marginBottom: "0.6rem", display: "block" }}
            ></i>
            <p style={{ fontWeight: 600, color: "#065F46", fontSize: "1.05rem" }}>
              Sin antecedentes de daños ni incidencias.
            </p>
            <span style={{ fontSize: "0.85rem" }}>
              Legajo en estado óptimo y sin penalizaciones activas.
            </span>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              border: "1px solid var(--beige-anchor)",
              borderRadius: "8px",
            }}
          >
            <table className="data-table" style={{ width: "100%", margin: 0 }}>
              <thead>
                <tr>
                  <th>ID Daño</th>
                  <th>Fecha y Hora</th>
                  <th>Libro Afectado</th>
                  <th>Nivel de Daño</th>
                  <th>Descripción</th>
                  <th>Registrado Por</th>
                </tr>
              </thead>
              <tbody>
                {expediente.map((d) => {
                  const cfg = NIVEL_CONFIG[d.nivelDano];
                  return (
                    <tr key={d.id}>
                      <td>
                        <code style={{ fontSize: "0.78rem" }}>{d.id}</code>
                      </td>
                      <td style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>{d.fechaHora}</td>
                      <td style={{ fontWeight: 600 }}>{d.libroTitulo}</td>
                      <td>
                        <span className={`badge ${cfg.badgeClass}`}>{cfg.badge}</span>
                      </td>
                      <td style={{ fontSize: "0.83rem", color: "var(--text-muted)" }}>
                        {d.descripcion}
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>{d.registradoPor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div
        className="modal-actions"
        style={{
          borderTop: "1px solid var(--beige-anchor)",
          paddingTop: "0.8rem",
          marginTop: "1rem",
          justifyContent: "flex-end",
        }}
      >
        <button type="button" className="btn-secondary" onClick={closeModal}>
          Cerrar
        </button>
      </div>
    </ModalWrapper>
  );
};
