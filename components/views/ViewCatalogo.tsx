"use client";

import React from "react";
import { useApp } from "@/store/AppContext";
import { Book } from "@/lib/types";

export const ViewCatalogo: React.FC = () => {
  const {
    books,
    catalogSearch,
    setCatalogSearch,
    openModal,
    updateBookCopies
  } = useApp();

  const filteredBooks = books.filter((b) => {
    if (!catalogSearch) return true;
    const term = catalogSearch.toLowerCase();
    return (
      b.titulo.toLowerCase().includes(term) ||
      b.autor.toLowerCase().includes(term) ||
      b.isbn.toLowerCase().includes(term) ||
      b.inventario.toLowerCase().includes(term) ||
      (b.categoria && b.categoria.toLowerCase().includes(term))
    );
  });

  const getBadgeInfo = (copies: number) => {
    if (copies === 0) return { className: "badge-borrowed", text: "Agotado" };
    if (copies === 1) return { className: "badge-low", text: "Pocas Copias" };
    return { className: "badge-available", text: "Disponible" };
  };

  return (
    <div id="viewCatalogo" className="view-section active-view">
      <section className="welcome-section">
        <div className="welcome-text">
          <h1>Catálogo Completo de Libros</h1>
          <p>Inventario general de títulos disponibles y en préstamo.</p>
        </div>
        <button
          className="btn-primary"
          id="btnAgregarNuevoLibro"
          onClick={() => openModal("nuevoLibro")}
        >
          <i className="fa-solid fa-plus" aria-hidden="true"></i> Añadir Nuevo Libro
        </button>
      </section>

      <section className="catalog-section">
        <div className="section-header section-header--wrap">
          <div>
            <h2 className="section-title">Listado del Fondo Editorial</h2>
            <span className="section-header__count">
              Total Títulos: <strong id="totalLibrosCount">{filteredBooks.length}</strong>
            </span>
          </div>
          <div className="search-bar-catalog">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              type="text"
              id="catalogSearchInput"
              placeholder="Buscar por título, autor, materia, ISBN o inventario..."
              aria-label="Buscar en el catálogo"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">ISBN / ID</th>
              <th scope="col">Título</th>
              <th scope="col">Autor / Categoría</th>
              <th scope="col">Ubicación / Inventario</th>
              <th scope="col">Copias</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody id="catalogTableBody">
            {filteredBooks.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)" }}>
                  No se encontraron libros con ese criterio de búsqueda.
                </td>
              </tr>
            ) : (
              filteredBooks.map((book) => {
                const badge = getBadgeInfo(book.copias);
                return (
                  <tr key={book.isbn}>
                    <td>
                      <strong>{book.isbn}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--accent-brown)" }}>
                        {book.titulo}
                      </div>
                      {book.subtitulo && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {book.subtitulo}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{book.autor}</div>
                      <div style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
                        {book.categoria}
                      </div>
                    </td>
                    <td>
                      <div>{book.ubicacion}</div>
                      <div style={{ fontSize: "0.8rem" }}>Inv: {book.inventario}</div>
                    </td>
                    <td>
                      <div className="qty-control">
                        <button
                          className="btn-qty btn-qty--minus"
                          onClick={() => updateBookCopies(book.isbn, -1)}
                          disabled={book.copias <= 0}
                          title="Reducir copia"
                        >
                          -
                        </button>
                        <span className="qty-val">{book.copias}</span>
                        <button
                          className="btn-qty btn-qty--plus"
                          onClick={() => updateBookCopies(book.isbn, 1)}
                          title="Añadir copia"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${badge.className}`}>{badge.text}</span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary btnVerFicha"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                        onClick={() => openModal("detalleLibro", book)}
                      >
                        <i className="fa-solid fa-eye"></i> Ver
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
