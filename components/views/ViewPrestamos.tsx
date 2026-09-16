"use client";

import React from "react";
import { useApp } from "@/store/AppContext";

export const ViewPrestamos: React.FC = () => {
  const { loans, loansFilter, setLoansFilter, openModal } = useApp();

  const filteredLoans = loans.filter((l) => {
    if (loansFilter === "all") return true;
    return l.estado === loansFilter;
  });

  const getBadge = (estado: string) => {
    if (estado === "devuelto") return { className: "badge-available", text: "Devuelto" };
    if (estado === "moroso") return { className: "badge-overdue", text: "Moroso" };
    return { className: "badge-borrowed", text: "Prestado" };
  };

  return (
    <div id="viewPrestamos" className="view-section active-view">
      <section className="welcome-section">
        <div className="welcome-text">
          <h1>Historial de Préstamos</h1>
          <p>Registro continuo de préstamos, entregas e imprevistos.</p>
        </div>
        <div className="welcome-actions">
          <button
            className="btn-primary btnAbrirNuevoPrestamo"
            onClick={() => openModal("prestamo")}
          >
            <i className="fa-solid fa-plus" aria-hidden="true"></i> Nuevo Préstamo
          </button>
          <button
            className="btn-secondary"
            id="btnDevolucion"
            onClick={() => openModal("devolucion")}
          >
            <i className="fa-solid fa-repeat" aria-hidden="true"></i> Registrar Devolución
          </button>
        </div>
      </section>

      <section className="recent-loans-section">
        <div className="loans-filter-bar">
          <button
            className={`btn-filter ${loansFilter === "all" ? "active" : ""}`}
            onClick={() => setLoansFilter("all")}
          >
            Todos
          </button>
          <button
            className={`btn-filter ${loansFilter === "prestado" ? "active" : ""}`}
            onClick={() => setLoansFilter("prestado")}
          >
            Activos (Prestados)
          </button>
          <button
            className={`btn-filter ${loansFilter === "moroso" ? "active" : ""}`}
            onClick={() => setLoansFilter("moroso")}
          >
            Morosos (Demorados)
          </button>
          <button
            className={`btn-filter ${loansFilter === "devuelto" ? "active" : ""}`}
            onClick={() => setLoansFilter("devuelto")}
          >
            Devueltos
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">ID Préstamo</th>
              <th scope="col">Libro</th>
              <th scope="col">Socio / Alumno / Prof.</th>
              <th scope="col">Fecha Préstamo</th>
              <th scope="col">Fecha Límite</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody id="loansTableBody">
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)" }}>
                  No se encontraron préstamos con ese filtro.
                </td>
              </tr>
            ) : (
              filteredLoans.map((l) => {
                const badge = getBadge(l.estado);
                return (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.id}</strong>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--accent-brown)" }}>
                      {l.libro}
                    </td>
                    <td>{l.socioNombre}</td>
                    <td>{l.fechaPrestamo}</td>
                    <td>{l.fechaLimite}</td>
                    <td>
                      <span className={`badge ${badge.className}`}>{badge.text}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};
