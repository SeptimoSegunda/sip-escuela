"use client";

import React from "react";
import { ModalWrapper } from "./ModalWrapper";
import { useApp } from "@/store/AppContext";

export const ModalDetalleLibro: React.FC = () => {
  const { selectedBook, loans, closeModal } = useApp();

  if (!selectedBook) return null;

  const bookLoans = loans.filter(
    (l) => l.libro.toLowerCase() === selectedBook.titulo.toLowerCase()
  );

  const getBadge = (estado: string) => {
    if (estado === "devuelto") return { className: "badge-available", text: "Devuelto" };
    if (estado === "moroso") return { className: "badge-overdue", text: "Moroso" };
    return { className: "badge-borrowed", text: "En Curso" };
  };

  return (
    <ModalWrapper
      id="modalDetalleLibro"
      title={selectedBook.titulo}
      subtitle={selectedBook.subtitulo || "Sin subtítulo"}
      isLarge
    >
      <div className="book-details-container">
        <div className="details-grid">
          {/* Ficha Técnica */}
          <div className="detail-section-card">
            <div className="detail-section-header">
              <i className="fa-solid fa-address-card" aria-hidden="true"></i> Ficha Técnica
            </div>
            <div className="detail-fields-list">
              <div className="detail-field">
                <span className="field-label">ISBN / ID Libro:</span>
                <strong className="field-value">{selectedBook.isbn || "-"}</strong>
              </div>
              <div className="detail-field">
                <span className="field-label">Libristica:</span>
                <span className="field-value">{selectedBook.libristica || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Número de Inventario:</span>
                <strong className="field-value">{selectedBook.inventario || "-"}</strong>
              </div>
              <div className="detail-field">
                <span className="field-label">Ubicación Física:</span>
                <span className="field-value">{selectedBook.ubicacion || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Clasificación:</span>
                <strong className="field-value field-value--accent">
                  {selectedBook.clasificacion || "-"}
                </strong>
              </div>
              <div className="detail-field">
                <span className="field-label">Extensión:</span>
                <span className="field-value">
                  {selectedBook.extension ? `${selectedBook.extension} págs.` : "-"}
                </span>
              </div>
              <div className="detail-field">
                <span className="field-label">Disponibilidad:</span>
                <span className="field-value">{selectedBook.copias} copias</span>
              </div>
            </div>
          </div>

          {/* Publicación */}
          <div className="detail-section-card">
            <div className="detail-section-header">
              <i className="fa-solid fa-print" aria-hidden="true"></i> Publicación y Edición
            </div>
            <div className="detail-fields-list">
              <div className="detail-field">
                <span className="field-label">Editorial:</span>
                <span className="field-value">{selectedBook.editorial || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Fecha de Publicación:</span>
                <span className="field-value">{selectedBook.fecha || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Lugar de Publicación:</span>
                <span className="field-value">{selectedBook.lugarPublicacion || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Edición:</span>
                <span className="field-value">{selectedBook.edicion || "-"}</span>
              </div>
            </div>
          </div>

          {/* Temas */}
          <div className="detail-section-card">
            <div className="detail-section-header">
              <i className="fa-solid fa-tags" aria-hidden="true"></i> Temas y Clasificación
            </div>
            <div className="detail-fields-list">
              <div className="detail-field">
                <span className="field-label">Categoría:</span>
                <span className="field-value">{selectedBook.categoria || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Temas / Palabras clave:</span>
                <span className="field-value">{selectedBook.temas || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Término Materia:</span>
                <span className="field-value">{selectedBook.terminoMateria || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Número de Tomo:</span>
                <span className="field-value">{selectedBook.numero || "-"}</span>
              </div>
            </div>
          </div>

          {/* Colección */}
          <div className="detail-section-card">
            <div className="detail-section-header">
              <i className="fa-solid fa-building-columns" aria-hidden="true"></i> Colección y Direcciones
            </div>
            <div className="detail-fields-list">
              <div className="detail-field">
                <span className="field-label">Dirección Personal:</span>
                <span className="field-value">{selectedBook.coleccionPersonal || "-"}</span>
              </div>
              <div className="detail-field">
                <span className="field-label">Dirección Institucional:</span>
                <span className="field-value">{selectedBook.coleccionInstitucional || "-"}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="detail-section-card detail-section-card--full">
            <div className="detail-section-header">
              <i className="fa-solid fa-file-lines" aria-hidden="true"></i> Notas Adicionales
            </div>
            <div className="detail-notes-body">
              <div>
                <h3 className="detail-note-heading">Nota General:</h3>
                <p className="detail-note-text detail-note-text--salvia">
                  {selectedBook.notaGeneral || "Sin notas generales."}
                </p>
              </div>
              <div>
                <h3 className="detail-note-heading">Nota de Contenido:</h3>
                <p className="detail-note-text detail-note-text--terracotta">
                  {selectedBook.notaContenido || "Sin notas de contenido."}
                </p>
              </div>
            </div>
          </div>

          {/* Historial de préstamos del libro */}
          <div className="detail-section-card detail-section-card--full">
            <div className="detail-section-header">
              <i className="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Historial de Préstamos de este Libro
            </div>
            <div className="detail-table-wrapper">
              <table className="data-table data-table--sm">
                <thead>
                  <tr>
                    <th scope="col">ID Préstamo</th>
                    <th scope="col">Socio / Lector</th>
                    <th scope="col">Fecha Préstamo</th>
                    <th scope="col">Fecha Límite</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {bookLoans.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem" }}>
                        Este libro no tiene registros de préstamos históricos.
                      </td>
                    </tr>
                  ) : (
                    bookLoans.map((l) => {
                      const badge = getBadge(l.estado);
                      return (
                        <tr key={l.id}>
                          <td>
                            <strong>{l.id}</strong>
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
            </div>
          </div>
        </div>
      </div>

      <div className="modal-actions modal-actions--top-border">
        <button
          type="button"
          className="btn-primary btn--ml-auto btnCerrarModal"
          onClick={closeModal}
        >
          Cerrar Ficha
        </button>
      </div>
    </ModalWrapper>
  );
};
