"use client";

import React from "react";
import { useApp } from "@/store/AppContext";
import { formatNumber } from "@/lib/utils";

export const ViewInicio: React.FC = () => {
  const { books, socios, loans, openModal } = useApp();

  const totalTitles = books.length;
  const totalPhysicalCopies = books.reduce((acc, b) => acc + b.copias, 0);
  const activeLoans = loans.filter((l) => l.estado === "prestado").length;
  const overdueLoans = loans.filter((l) => l.estado === "moroso").length;
  const totalLoansCount = activeLoans + overdueLoans;

  const totalPossible = totalPhysicalCopies + totalLoansCount;
  const percent = totalPossible > 0 ? Math.round((totalPhysicalCopies / totalPossible) * 100) : 100;

  return (
    <div id="viewInicio" className="view-section active-view">
      <section className="welcome-section">
        <div className="welcome-text">
          <h1>Panel de Control Principal</h1>
          <p>Estado actual de la biblioteca en tiempo real.</p>
        </div>
        <button
          className="btn-primary btnAbrirNuevoPrestamo"
          onClick={() => openModal("prestamo")}
        >
          <i className="fa-solid fa-plus" aria-hidden="true"></i> Nuevo Préstamo
        </button>
      </section>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon metric-icon--salvia">
            <i className="fa-solid fa-book" aria-hidden="true"></i>
          </div>
          <div className="metric-data">
            <h3 id="statEstanteria">{formatNumber(totalPhysicalCopies)}</h3>
            <p>Libros en Estantería</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon metric-icon--terracotta">
            <i className="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
          </div>
          <div className="metric-data">
            <h3 id="statPrestamos">{totalLoansCount}</h3>
            <p>Préstamos Activos</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon metric-icon--mustard">
            <i className="fa-solid fa-users" aria-hidden="true"></i>
          </div>
          <div className="metric-data">
            <h3 id="statSocios">{socios.length}</h3>
            <p>Socios Registrados</p>
          </div>
        </div>
      </section>

      <div className="dashboard-details-grid">
        {/* Resumen de Inventario */}
        <div className="report-card">
          <h2 className="section-title">Resumen de Inventario</h2>
          <div className="inventory-bars-group">
            <div className="bar-item">
              <div className="bar-label">
                <span>Disponibilidad General</span>
                <span id="inventoryPercent">{percent}%</span>
              </div>
              <div className="bar-track">
                <div
                  id="inventoryBar"
                  className="bar-fill bar-fill--salvia"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
            <div className="inventory-totals">
              <div>
                <div id="dashTotalBooks" className="inventory-total-value">{totalTitles}</div>
                <div className="inventory-total-label">Títulos Totales</div>
              </div>
              <div>
                <div id="dashTotalCopies" className="inventory-total-value inventory-total-value--accent">
                  {totalPhysicalCopies}
                </div>
                <div className="inventory-total-label">Ejemplares Físicos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Préstamos */}
        <div className="report-card">
          <h2 className="section-title">Estado de Préstamos</h2>
          <div className="loans-status-list">
            <div className="loans-status-row">
              <span className="loans-status-label">Préstamos al día</span>
              <span id="dashLoansActive" className="badge badge-available">
                {activeLoans}
              </span>
            </div>
            <div className="loans-status-row loans-status-row--overdue">
              <span className="loans-status-label loans-status-label--overdue">
                Préstamos Morosos
              </span>
              <span id="dashLoansOverdue" className="badge badge-overdue">
                {overdueLoans}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
