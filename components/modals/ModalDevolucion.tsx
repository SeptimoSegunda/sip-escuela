"use client";

import React, { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { useApp } from "@/store/AppContext";
import { NivelDano } from "@/lib/types";

export const ModalDevolucion: React.FC = () => {
  const { loans, returnLoan, closeModal } = useApp();
  const activeLoans = loans.filter((l) => l.estado !== "devuelto");
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    activeLoans.length > 0 ? activeLoans[0].id : ""
  );
  const [tieneDano, setTieneDano] = useState(false);
  const [nivelDano, setNivelDano] = useState<NivelDano>("Daño leve");
  const [descripcionDano, setDescripcionDano] = useState("");
  const [estadoPosterior, setEstadoPosterior] = useState<"disponible" | "mantenimiento">("mantenimiento");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) {
      alert("Selecciona un préstamo a devolver.");
      return;
    }
    returnLoan(
      selectedLoanId,
      tieneDano
        ? { nivelDano, descripcion: descripcionDano, estadoPosterior }
        : undefined
    );
  };

  return (
    <ModalWrapper id="modalDevolucion" title="Registrar Devolución de Libro">
      <form id="formDevolucion" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="selectLibroDevolucion">Selecciona el libro a devolver</label>
          {activeLoans.length === 0 ? (
            <p style={{ color: "var(--text-muted)", padding: "0.5rem 0" }}>
              No hay préstamos activos pendientes de devolución.
            </p>
          ) : (
            <select
              id="selectLibroDevolucion"
              required
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
            >
              {activeLoans.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.libro} — [Socio: {l.socioNombre}] ({l.estado})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Panel de reporte de daño */}
        <div
          className="damage-report-box"
          style={{
            marginTop: "1rem",
            background: "var(--bg-base)",
            border: "1px solid var(--beige-anchor)",
            borderRadius: "8px",
            padding: "0.8rem",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#721C24",
            }}
          >
            <input
              type="checkbox"
              checked={tieneDano}
              onChange={(e) => setTieneDano(e.target.checked)}
              id="checkDevolucionDano"
              style={{ width: "16px", height: "16px", accentColor: "var(--accent-terracotta)" }}
            />
            <span>
              <i className="fa-solid fa-triangle-exclamation"></i> ¿El ejemplar presenta algún daño
              físico?
            </span>
          </label>

          {tieneDano && (
            <div
              style={{
                marginTop: "0.8rem",
                borderTop: "1px dashed var(--beige-dark)",
                paddingTop: "0.8rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label
                  htmlFor="selectNivelDanoDevolucion"
                  style={{ fontSize: "0.8rem", fontWeight: 700 }}
                >
                  Nivel de Daño *
                </label>
                <select
                  id="selectNivelDanoDevolucion"
                  value={nivelDano}
                  onChange={(e) => setNivelDano(e.target.value as NivelDano)}
                  style={{ fontWeight: 600 }}
                >
                  <option value="Daño leve">
                    🟢 Daño leve (Hojas dobladas, marcas de lápiz, desgaste menor)
                  </option>
                  <option value="Daño moderado">
                    🟠 Daño moderado (Manchas, subrayado en tinta, hojas sueltas, lomo resentido)
                  </option>
                  <option value="CATASTROFICO!">
                    🔴 CATASTRÓFICO! (Páginas rotas o arrancadas, mojado, pérdida total)
                  </option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label
                  htmlFor="inputDescripcionDanoDevolucion"
                  style={{ fontSize: "0.8rem" }}
                >
                  Descripción del Daño *
                </label>
                <textarea
                  id="inputDescripcionDanoDevolucion"
                  rows={2}
                  value={descripcionDano}
                  onChange={(e) => setDescripcionDano(e.target.value)}
                  placeholder="Ej: Presenta 4 hojas rotas con tinta y mancha en la contratapa"
                  required={tieneDano}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="selectAccionCopiaDevolucion" style={{ fontSize: "0.8rem" }}>
                  Estado Posterior del Ejemplar
                </label>
                <select
                  id="selectAccionCopiaDevolucion"
                  value={estadoPosterior}
                  onChange={(e) =>
                    setEstadoPosterior(e.target.value as "disponible" | "mantenimiento")
                  }
                  style={{ fontSize: "0.85rem" }}
                >
                  <option value="disponible">Mantener Disponible (Apto para lectura)</option>
                  <option value="mantenimiento">
                    Pasar a &quot;En Mantenimiento&quot; (Requiere restauración y revisión)
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: "1.2rem" }}>
          <button type="button" className="btn-secondary" onClick={closeModal}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={activeLoans.length === 0}>
            Confirmar Devolución
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
