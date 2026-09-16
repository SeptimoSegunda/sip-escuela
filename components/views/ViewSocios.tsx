"use client";

import React from "react";
import { useApp } from "@/store/AppContext";

export const ViewSocios: React.FC = () => {
  const { socios, loans, openModal, deleteSocio } = useApp();

  const handleDelete = (id: string, apellido: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al socio ${apellido}, ${nombre}?`)) {
      deleteSocio(id);
    }
  };

  return (
    <div id="viewSocios" className="view-section active-view">
      <section className="welcome-section">
        <div className="welcome-text">
          <h1>Gestión Integral de Socios</h1>
          <p>Administración de estudiantes, docentes y personal habilitado.</p>
        </div>
        <button
          className="btn-primary btnAbrirNuevoSocio"
          onClick={() => openModal("socio")}
        >
          <i className="fa-solid fa-user-plus" aria-hidden="true"></i> Registrar Socio
        </button>
      </section>

      <section className="catalog-section">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">ID Usuario</th>
              <th scope="col">Apellido y Nombre</th>
              <th scope="col">Tipo de Socio</th>
              <th scope="col">Año / Turno</th>
              <th scope="col">Email</th>
              <th scope="col">Préstamos Activos</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody id="sociosTableBody">
            {socios.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)" }}>
                  No hay socios registrados.
                </td>
              </tr>
            ) : (
              socios.map((s) => {
                const activeCount = loans.filter(
                  (l) => l.socioId === s.id && (l.estado === "prestado" || l.estado === "moroso")
                ).length;
                const limit = s.tipo === "docente" ? 3 : 1;

                return (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.id}</strong>
                    </td>
                    <td>{s.apellido}, {s.nombre}</td>
                    <td style={{ textTransform: "capitalize" }}>{s.tipo}</td>
                    <td>{s.anio} / {s.turno}</td>
                    <td>{s.email}</td>
                    <td>
                      <strong>
                        {activeCount} / {limit}
                      </strong>
                    </td>
                    <td>
                      <span className="badge badge-available">Activo</span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary btnEliminarSocio"
                        style={{ color: "#721C24", borderColor: "#F5C6CB" }}
                        onClick={() => handleDelete(s.id, s.apellido, s.nombre)}
                        title="Eliminar socio"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
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
