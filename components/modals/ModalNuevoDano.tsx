"use client";

import React, { useState } from "react";
import { useApp } from "@/store/AppContext";
import { ModalWrapper } from "./ModalWrapper";
import { NivelDano } from "@/lib/types";

export const ModalNuevoDano: React.FC = () => {
  const { books, socios, closeModal, addDano } = useApp();
  const [libroQuery, setLibroQuery] = useState("");
  const [socioQuery, setSocioQuery] = useState("");
  const [selectedLibro, setSelectedLibro] = useState<string>("");
  const [selectedSocioId, setSelectedSocioId] = useState<string>("");
  const [selectedSocioNombre, setSelectedSocioNombre] = useState<string>("");
  const [nivel, setNivel] = useState<NivelDano>("Daño leve");
  const [descripcion, setDescripcion] = useState("");
  const [estadoPosterior, setEstadoPosterior] = useState<"disponible" | "mantenimiento">("mantenimiento");
  const [showLibroSugg, setShowLibroSugg] = useState(false);
  const [showSocioSugg, setShowSocioSugg] = useState(false);

  const libroSugg = libroQuery.length > 1
    ? books.filter((b) => b.titulo.toLowerCase().includes(libroQuery.toLowerCase())).slice(0, 5)
    : [];

  const socioSugg = socioQuery.length > 1
    ? socios
        .filter((s) =>
          `${s.apellido} ${s.nombre}`.toLowerCase().includes(socioQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(socioQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLibro || !selectedSocioId || !descripcion) return;
    addDano({
      libroTitulo: selectedLibro,
      socioId: selectedSocioId,
      socioNombre: selectedSocioNombre,
      nivelDano: nivel,
      descripcion,
      estadoPosterior,
    });
  };

  return (
    <ModalWrapper id="modalNuevoDano" title="Registrar Incidencia de Daño" isLarge>
      <form onSubmit={handleSubmit}>
          {/* Libro */}
          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="inputDanoLibro">Libro Afectado *</label>
            <input
              id="inputDanoLibro"
              type="text"
              value={libroQuery}
              onChange={(e) => {
                setLibroQuery(e.target.value);
                setSelectedLibro("");
                setShowLibroSugg(true);
              }}
              placeholder="Busca título de libro..."
              required
              autoComplete="off"
            />
            {showLibroSugg && libroSugg.length > 0 && (
              <div className="autocomplete-suggestions" style={{ display: "block" }}>
                {libroSugg.map((b) => (
                  <div
                    key={b.isbn}
                    className="autocomplete-item"
                    onMouseDown={() => {
                      setSelectedLibro(b.titulo);
                      setLibroQuery(b.titulo);
                      setShowLibroSugg(false);
                    }}
                  >
                    {b.titulo}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Socio */}
          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="inputDanoSocio">Usuario Responsable *</label>
            <input
              id="inputDanoSocio"
              type="text"
              value={socioQuery}
              onChange={(e) => {
                setSocioQuery(e.target.value);
                setSelectedSocioId("");
                setShowSocioSugg(true);
              }}
              placeholder="Busca socio por nombre o ID..."
              required
              autoComplete="off"
            />
            {showSocioSugg && socioSugg.length > 0 && (
              <div className="autocomplete-suggestions" style={{ display: "block" }}>
                {socioSugg.map((s) => (
                  <div
                    key={s.id}
                    className="autocomplete-item"
                    onMouseDown={() => {
                      setSelectedSocioId(s.id);
                      setSelectedSocioNombre(`${s.apellido}, ${s.nombre}`);
                      setSocioQuery(`${s.apellido}, ${s.nombre}`);
                      setShowSocioSugg(false);
                    }}
                  >
                    {s.apellido}, {s.nombre} — {s.id}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nivel */}
          <div className="form-group">
            <label htmlFor="selectNivelDanoDirecto">Nivel de Daño *</label>
            <select
              id="selectNivelDanoDirecto"
              value={nivel}
              onChange={(e) => setNivel(e.target.value as NivelDano)}
              style={{ fontWeight: 600 }}
              required
            >
              <option value="Daño leve">🟢 Daño leve (Hojas dobladas, marcas lápiz, desgaste menor)</option>
              <option value="Daño moderado">🟠 Daño moderado (Manchas, birome o marcador, hojas sueltas)</option>
              <option value="CATASTROFICO!">🔴 CATASTRÓFICO! (Páginas rotas o arrancadas, mojado, inutilizado)</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="inputDescripcionDanoDirecto">Descripción del Daño *</label>
            <textarea
              id="inputDescripcionDanoDirecto"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Especifica qué daño tiene el ejemplar..."
              required
            />
          </div>

          {/* Estado posterior */}
          <div className="form-group">
            <label htmlFor="selectAccionCopiaDirecto">Estado Posterior del Ejemplar</label>
            <select
              id="selectAccionCopiaDirecto"
              value={estadoPosterior}
              onChange={(e) => setEstadoPosterior(e.target.value as "disponible" | "mantenimiento")}
            >
              <option value="mantenimiento">Pasar a &quot;En Mantenimiento&quot;</option>
              <option value="disponible">Mantener como &quot;Disponible&quot;</option>
            </select>
          </div>

          <div className="modal-actions" style={{ marginTop: "1.2rem" }}>
            <button type="button" className="btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Registrar Daño
            </button>
          </div>
        </form>
    </ModalWrapper>
  );
};
