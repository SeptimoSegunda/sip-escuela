"use client";

import React, { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { useApp } from "@/store/AppContext";
import { Book, Socio } from "@/lib/types";

export const ModalPrestamo: React.FC = () => {
  const { books, socios, loans, addLoan, closeModal } = useApp();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedSocio, setSelectedSocio] = useState<Socio | null>(null);

  const [bookQuery, setBookQuery] = useState("");
  const [socioQuery, setSocioQuery] = useState("");

  const [showBookList, setShowBookList] = useState(false);
  const [showSocioList, setShowSocioList] = useState(false);

  const bookMatches = bookQuery.trim()
    ? books.filter(
        (b) =>
          b.titulo.toLowerCase().includes(bookQuery.toLowerCase()) ||
          b.isbn.toLowerCase().includes(bookQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const socioMatches = socioQuery.trim()
    ? socios.filter(
        (s) =>
          `${s.apellido} ${s.nombre}`.toLowerCase().includes(socioQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(socioQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedSocio) {
      alert("Por favor, selecciona libro y socio de las sugerencias.");
      return;
    }

    if (selectedBook.copias <= 0) {
      alert("El libro seleccionado no tiene copias disponibles.");
      return;
    }

    const activeCount = loans.filter(
      (l) => l.socioId === selectedSocio.id && (l.estado === "prestado" || l.estado === "moroso")
    ).length;
    const limit = selectedSocio.tipo === "docente" ? 3 : 1;

    if (
      activeCount >= limit &&
      !window.confirm(
        `Límite de préstamos alcanzado (${activeCount} de ${limit}). ¿Desea autorizar excepcionalmente?`
      )
    ) {
      return;
    }

    addLoan(selectedBook, selectedSocio);
  };

  return (
    <ModalWrapper id="modalPrestamo" title="Registrar Nuevo Préstamo">
      <form id="formNuevoPrestamo" autoComplete="off" onSubmit={handleSubmit}>
        <div className="form-group form-group--autocomplete">
          <label htmlFor="inputLibro">Título del Libro *</label>
          <input
            type="text"
            id="inputLibro"
            placeholder="Busca libro disponible..."
            required
            value={bookQuery}
            onChange={(e) => {
              setBookQuery(e.target.value);
              setSelectedBook(null);
              setShowBookList(true);
            }}
            onFocus={() => setShowBookList(true)}
          />
          {showBookList && bookMatches.length > 0 && (
            <div id="autocompleteLibroList" className="autocomplete-suggestions">
              {bookMatches.map((b) => (
                <div
                  key={b.isbn}
                  className="autocomplete-suggestion-item"
                  onClick={() => {
                    setSelectedBook(b);
                    setBookQuery(b.titulo);
                    setShowBookList(false);
                  }}
                >
                  <span className="suggestion-main">{b.titulo}</span>
                  <span className="suggestion-sub">
                    ISBN: {b.isbn} - Disp: {b.copias}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group form-group--autocomplete">
          <label htmlFor="inputSocio">Apellido y Nombre del Socio *</label>
          <input
            type="text"
            id="inputSocio"
            placeholder="Busca socio por nombre o apellido..."
            required
            value={socioQuery}
            onChange={(e) => {
              setSocioQuery(e.target.value);
              setSelectedSocio(null);
              setShowSocioList(true);
            }}
            onFocus={() => setShowSocioList(true)}
          />
          {showSocioList && socioMatches.length > 0 && (
            <div id="autocompleteSocioList" className="autocomplete-suggestions">
              {socioMatches.map((s) => (
                <div
                  key={s.id}
                  className="autocomplete-suggestion-item"
                  onClick={() => {
                    setSelectedSocio(s);
                    setSocioQuery(`${s.apellido}, ${s.nombre}`);
                    setShowSocioList(false);
                  }}
                >
                  <span className="suggestion-main">
                    {s.apellido}, {s.nombre}
                  </span>
                  <span className="suggestion-sub">
                    ID: {s.id} - {s.tipo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary btnCancelarModal" onClick={closeModal}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Registrar Préstamo
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
