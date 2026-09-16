"use client";

import React, { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { useApp } from "@/store/AppContext";
import { Book } from "@/lib/types";

export const ModalNuevoLibro: React.FC = () => {
  const { addBook, closeModal } = useApp();

  const [formData, setFormData] = useState<Partial<Book>>({
    titulo: "",
    subtitulo: "",
    autor: "",
    categoria: "Novela",
    isbn: "",
    edicion: "",
    extension: "",
    copias: 3,
    libristica: "",
    inventario: "",
    ubicacion: "",
    clasificacion: "",
    numero: "",
    editorial: "",
    fecha: "",
    lugarPublicacion: "",
    temas: "",
    terminoMateria: "",
    coleccionPersonal: "",
    coleccionInstitucional: "",
    notaGeneral: "",
    notaContenido: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    const fieldMap: Record<string, keyof Book> = {
      inputTituloLibro: "titulo",
      inputSubtituloLibro: "subtitulo",
      inputAutorLibro: "autor",
      inputCategoriaLibro: "categoria",
      inputIsbn: "isbn",
      inputEdicion: "edicion",
      inputExtension: "extension",
      inputCantidadLibro: "copias",
      inputLibristica: "libristica",
      inputInventario: "inventario",
      inputUbicacion: "ubicacion",
      inputClasificacion: "clasificacion",
      inputNumero: "numero",
      inputEditorial: "editorial",
      inputFechaPublicacion: "fecha",
      inputLugarPublicacion: "lugarPublicacion",
      inputTemas: "temas",
      inputTerminoMateria: "terminoMateria",
      inputColeccionPersonal: "coleccionPersonal",
      inputColeccionInstitucional: "coleccionInstitucional",
      inputNotaGeneral: "notaGeneral",
      inputNotaContenido: "notaContenido"
    };

    const key = fieldMap[id];
    if (key) {
      setFormData((prev) => ({
        ...prev,
        [key]: key === "copias" ? parseInt(value, 10) || 0 : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.autor || !formData.isbn || !formData.inventario || !formData.ubicacion || !formData.clasificacion) {
      alert("Por favor completa todos los campos obligatorios (*).");
      return;
    }

    const newBook: Book = {
      titulo: formData.titulo || "",
      subtitulo: formData.subtitulo,
      autor: formData.autor || "",
      categoria: formData.categoria || "General",
      isbn: formData.isbn || "",
      edicion: formData.edicion,
      extension: formData.extension,
      copias: formData.copias ?? 1,
      libristica: formData.libristica,
      inventario: formData.inventario || "",
      ubicacion: formData.ubicacion || "",
      clasificacion: formData.clasificacion || "",
      numero: formData.numero,
      editorial: formData.editorial,
      fecha: formData.fecha,
      lugarPublicacion: formData.lugarPublicacion,
      temas: formData.temas,
      terminoMateria: formData.terminoMateria,
      coleccionPersonal: formData.coleccionPersonal,
      coleccionInstitucional: formData.coleccionInstitucional,
      notaGeneral: formData.notaGeneral,
      notaContenido: formData.notaContenido
    };

    addBook(newBook);
  };

  return (
    <ModalWrapper id="modalNuevoLibro" title="Añadir Nuevo Libro al Catálogo" isLarge>
      <form id="formNuevoLibro" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Sección 1: Información Principal */}
          <div className="form-section-title">Información Principal</div>

          <div className="form-group">
            <label htmlFor="inputTituloLibro">Título *</label>
            <input
              type="text"
              id="inputTituloLibro"
              placeholder="Ej: Rayuela"
              required
              value={formData.titulo}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputSubtituloLibro">Subtítulo</label>
            <input
              type="text"
              id="inputSubtituloLibro"
              placeholder="Ej: Novela experimental"
              value={formData.subtitulo}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputAutorLibro">Autor *</label>
            <input
              type="text"
              id="inputAutorLibro"
              placeholder="Ej: Julio Cortázar"
              required
              value={formData.autor}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputCategoriaLibro">Categoría / Tema *</label>
            <input
              type="text"
              id="inputCategoriaLibro"
              placeholder="Ej: Novela"
              required
              value={formData.categoria}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputIsbn">ISBN / ID Libro *</label>
            <input
              type="text"
              id="inputIsbn"
              placeholder="Ej: 978-950-511-356-9"
              required
              value={formData.isbn}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputEdicion">Edición</label>
            <input
              type="text"
              id="inputEdicion"
              placeholder="Ej: 1ª Edición"
              value={formData.edicion}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputExtension">Extensión (Cantidad de páginas)</label>
            <input
              type="number"
              id="inputExtension"
              min="1"
              placeholder="Ej: 600"
              value={formData.extension}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputCantidadLibro">Cantidad de Copias *</label>
            <input
              type="number"
              id="inputCantidadLibro"
              min="0"
              required
              value={formData.copias}
              onChange={handleChange}
            />
          </div>

          {/* Sección 2: Inventario y Clasificación */}
          <div className="form-section-title">Inventario y Clasificación</div>

          <div className="form-group">
            <label htmlFor="inputLibristica">Libristica</label>
            <input
              type="text"
              id="inputLibristica"
              placeholder="Ej: LIBR-EXP"
              value={formData.libristica}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputInventario">Número de Inventario *</label>
            <input
              type="text"
              id="inputInventario"
              placeholder="Ej: INV-74839"
              required
              value={formData.inventario}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputUbicacion">Ubicación física en biblioteca *</label>
            <input
              type="text"
              id="inputUbicacion"
              placeholder="Ej: Estante 4, Sector B"
              required
              value={formData.ubicacion}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputClasificacion">Clasificación (CDU / Dewey) *</label>
            <input
              type="text"
              id="inputClasificacion"
              placeholder="Ej: 863 C828r"
              required
              value={formData.clasificacion}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputNumero">Número / Identificador de tomo</label>
            <input
              type="text"
              id="inputNumero"
              placeholder="Ej: Tomo 1"
              value={formData.numero}
              onChange={handleChange}
            />
          </div>

          {/* Sección 3: Datos de Publicación */}
          <div className="form-section-title">Datos de Publicación</div>

          <div className="form-group">
            <label htmlFor="inputEditorial">Editorial</label>
            <input
              type="text"
              id="inputEditorial"
              placeholder="Ej: Editorial Sudamericana"
              value={formData.editorial}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputFechaPublicacion">Fecha de Publicación</label>
            <input
              type="text"
              id="inputFechaPublicacion"
              placeholder="Ej: 1963"
              value={formData.fecha}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputLugarPublicacion">Lugar de Publicación</label>
            <input
              type="text"
              id="inputLugarPublicacion"
              placeholder="Ej: Buenos Aires, Argentina"
              value={formData.lugarPublicacion}
              onChange={handleChange}
            />
          </div>

          {/* Sección 4: Temas y Colección */}
          <div className="form-section-title">Temas y Colección</div>

          <div className="form-group">
            <label htmlFor="inputTemas">Temas (Palabras clave separados por coma)</label>
            <input
              type="text"
              id="inputTemas"
              placeholder="Ej: Surrealismo, Literatura Argentina, Amor"
              value={formData.temas}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputTerminoMateria">Término Materia</label>
            <input
              type="text"
              id="inputTerminoMateria"
              placeholder="Ej: Narrativa Argentina del Siglo XX"
              value={formData.terminoMateria}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputColeccionPersonal">Colección (Dirección Personal)</label>
            <input
              type="text"
              id="inputColeccionPersonal"
              placeholder="Ej: Colección Biblioteca Personal"
              value={formData.coleccionPersonal}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputColeccionInstitucional">Colección (Dirección Institucional)</label>
            <input
              type="text"
              id="inputColeccionInstitucional"
              placeholder="Ej: Archivo Histórico"
              value={formData.coleccionInstitucional}
              onChange={handleChange}
            />
          </div>

          {/* Sección 5: Notas */}
          <div className="form-section-title">Notas de Contenido</div>

          <div className="form-group form-group--full-width">
            <label htmlFor="inputNotaGeneral">Nota General</label>
            <textarea
              id="inputNotaGeneral"
              rows={2}
              placeholder="Ej: Obra fundamental de la literatura hispanoamericana."
              value={formData.notaGeneral}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="form-group form-group--full-width">
            <label htmlFor="inputNotaContenido">Nota de Contenido</label>
            <textarea
              id="inputNotaContenido"
              rows={2}
              placeholder="Ej: Primera parte: Del lado de allá..."
              value={formData.notaContenido}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div className="modal-actions modal-actions--spaced">
          <button type="button" className="btn-secondary btnCancelarModal" onClick={closeModal}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Añadir al Catálogo
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
