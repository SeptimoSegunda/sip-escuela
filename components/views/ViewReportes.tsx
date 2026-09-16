"use client";

import React from "react";
import { useApp } from "@/store/AppContext";
import { getLoanMonthKey } from "@/lib/utils";

export const ViewReportes: React.FC = () => {
  const { loans, socios, reportMonth, setReportMonth } = useApp();

  const periodLoans = reportMonth === "all"
    ? loans
    : loans.filter((l) => getLoanMonthKey(l.fechaPrestamo) === reportMonth);

  const totalPrestamos = periodLoans.length;
  const uniqueBooks = new Set(periodLoans.map((l) => l.libro.toLowerCase()));
  const librosEnCirculacion = uniqueBooks.size;
  const prestamosActivos = periodLoans.filter((l) => l.estado === "prestado" || l.estado === "moroso").length;
  const prestamosDevueltos = periodLoans.filter((l) => l.estado === "devuelto").length;

  // Top libros
  const bookCounts: Record<string, number> = {};
  periodLoans.forEach((l) => {
    bookCounts[l.libro] = (bookCounts[l.libro] || 0) + 1;
  });
  const sortedBooks = Object.entries(bookCounts).sort((a, b) => b[1] - a[1]);
  const maxBookCount = sortedBooks.length > 0 ? sortedBooks[0][1] : 1;

  // Distribución por cursos
  const socioCounts: Record<string, number> = {};
  periodLoans.forEach((l) => {
    const socio = socios.find(
      (s) => s.id === l.socioId || `${s.apellido}, ${s.nombre}`.toLowerCase() === l.socioNombre.toLowerCase()
    );
    const group = socio ? (socio.tipo === "estudiante" ? socio.anio || "Estudiante" : socio.tipo) : "General";
    socioCounts[group] = (socioCounts[group] || 0) + 1;
  });
  const sortedCursos = Object.entries(socioCounts).sort((a, b) => b[1] - a[1]);
  const maxCursoCount = sortedCursos.length > 0 ? sortedCursos[0][1] : 1;

  const getBadge = (estado: string) => {
    if (estado === "devuelto") return { className: "badge-available", text: "Devuelto" };
    if (estado === "moroso") return { className: "badge-overdue", text: "Moroso" };
    return { className: "badge-borrowed", text: "En Curso" };
  };

  return (
    <div id="viewReportes" className="view-section active-view">
      <section className="welcome-section">
        <div className="welcome-text">
          <h1>Reportes y Estadísticas de Préstamos</h1>
          <p>Métricas de circulación, libros más solicitados y comportamiento mensual.</p>
        </div>
        <div className="report-month-picker">
          <label htmlFor="selectReportMonth">
            <i className="fa-solid fa-calendar-days" aria-hidden="true"></i> Período:
          </label>
          <select
            id="selectReportMonth"
            className="select-period"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
          >
            <option value="08-2026">Agosto 2026 (Actual)</option>
            <option value="07-2026">Julio 2026</option>
            <option value="06-2026">Junio 2026</option>
            <option value="all">Histórico Completo</option>
          </select>
        </div>
      </section>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon metric-icon--salvia">
            <i className="fa-solid fa-chart-line" aria-hidden="true"></i>
          </div>
          <div className="metric-data">
            <h3 id="repTotalPrestamosMes">{totalPrestamos}</h3>
            <p>Préstamos en el Mes</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon metric-icon--salvia">
            <i className="fa-solid fa-book-open-reader" aria-hidden="true"></i>
          </div>
          <div className="metric-data">
            <h3 id="repLibrosCirculacion">{librosEnCirculacion}</h3>
            <p>Libros en Circulación</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon metric-icon--mustard">
            <i className="fa-solid fa-clock" aria-hidden="true"></i>
          </div>
          <div className="metric-data">
            <h3 id="repPrestamosActivos">{prestamosActivos}</h3>
            <p>Activos / En Curso</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon metric-icon--salvia">
            <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
          </div>
          <div className="metric-data">
            <h3 id="repPrestamosDevueltos">{prestamosDevueltos}</h3>
            <p>Devueltos a Término</p>
          </div>
        </div>
      </section>

      <div className="metrics-grid metrics-grid--spaced">
        {/* Ranking de libros más solicitados */}
        <div className="report-card">
          <h2 className="section-title">
            <i className="fa-solid fa-trophy report-icon--trophy" aria-hidden="true"></i>
            Libros Más Solicitados en el Mes
          </h2>
          <div className="chart-container" id="repTopLibrosContainer">
            {sortedBooks.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "1rem 0" }}>
                No hay préstamos en este período.
              </p>
            ) : (
              sortedBooks.slice(0, 5).map(([title, count]) => {
                const pct = Math.round((count / maxBookCount) * 100);
                return (
                  <div className="bar-item" key={title}>
                    <div className="bar-label">
                      <span>{title}</span>
                      <span>{count}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Distribución por cursos */}
        <div className="report-card">
          <h2 className="section-title">
            <i className="fa-solid fa-graduation-cap" aria-hidden="true"></i>
            Lectura por Curso / Nivel
          </h2>
          <div className="chart-container" id="repCursosContainer">
            {sortedCursos.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "1rem 0" }}>
                No hay datos disponibles.
              </p>
            ) : (
              sortedCursos.map(([curso, count]) => {
                const pct = Math.round((count / maxCursoCount) * 100);
                return (
                  <div className="bar-item" key={curso}>
                    <div className="bar-label">
                      <span>{curso}</span>
                      <span>{count}</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill bar-fill--salvia" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Detalle de préstamos del período */}
      <section className="recent-loans-section">
        <div className="section-header">
          <h2 className="section-title section-title--no-margin">
            <i className="fa-solid fa-list-check" aria-hidden="true"></i>
            Detalle de Préstamos del Período
          </h2>
          <span id="repTotalMovimientosBadge" className="badge badge-available">
            {totalPrestamos} movimientos
          </span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">ID Préstamo</th>
              <th scope="col">Libro</th>
              <th scope="col">Socio</th>
              <th scope="col">Fecha Préstamo</th>
              <th scope="col">Fecha Límite</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody id="repTableBody">
            {periodLoans.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem" }}>
                  Sin registros.
                </td>
              </tr>
            ) : (
              periodLoans.map((l) => {
                const badge = getBadge(l.estado);
                return (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.id}</strong>
                    </td>
                    <td>{l.libro}</td>
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
