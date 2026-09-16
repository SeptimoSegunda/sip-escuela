"use client";

import React, { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { useApp } from "@/store/AppContext";

export const ModalDevolucion: React.FC = () => {
  const { loans, returnLoan, closeModal } = useApp();
  const activeLoans = loans.filter((l) => l.estado !== "devuelto");
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    activeLoans.length > 0 ? activeLoans[0].id : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) {
      alert("Selecciona un préstamo a devolver.");
      return;
    }
    returnLoan(selectedLoanId);
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
        <div className="modal-actions">
          <button type="button" className="btn-secondary btnCancelarModal" onClick={closeModal}>
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
