"use client";

import React, { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { useApp } from "@/store/AppContext";
import { SocioTipo } from "@/lib/types";

export const ModalSocio: React.FC = () => {
  const { addSocio, closeModal } = useApp();

  const [apellido, setApellido] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<SocioTipo>("estudiante");
  const [anio, setAnio] = useState("");
  const [turno, setTurno] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSocio({
      apellido,
      nombre,
      tipo,
      anio: anio || "-",
      turno: turno || "-",
      email
    });
  };

  return (
    <ModalWrapper id="modalSocio" title="Registrar Nuevo Socio">
      <form id="formNuevoSocio" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="inputSocioApellido">Apellido *</label>
          <input
            type="text"
            id="inputSocioApellido"
            placeholder="Ej: Morales"
            required
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="inputSocioNombre">Nombre *</label>
          <input
            type="text"
            id="inputSocioNombre"
            placeholder="Ej: Valentina"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="selectSocioTipo">Tipo de Usuario *</label>
          <select
            id="selectSocioTipo"
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value as SocioTipo)}
          >
            <option value="estudiante">Estudiante (Máx 1 libro)</option>
            <option value="docente">Docente (Máx 3 libros)</option>
            <option value="otro">Otro (Máx 1 libro)</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="inputSocioAnio">Año / Grado (Opcional)</label>
          <input
            type="text"
            id="inputSocioAnio"
            placeholder="Ej: 5º Año A"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="inputSocioTurno">Turno (Opcional)</label>
          <input
            type="text"
            id="inputSocioTurno"
            placeholder="Ej: Mañana"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="inputSocioEmail">Email *</label>
          <input
            type="email"
            id="inputSocioEmail"
            placeholder="Ej: valentina@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-secondary btnCancelarModal" onClick={closeModal}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Guardar Socio
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
