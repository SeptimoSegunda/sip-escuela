"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="dashboard-footer">
      <div>
        <p>&copy; 2026 Sistema SIP — Proyecto Escolar de Biblioteca</p>
      </div>
      <div className="footer-links">
        <a href="#soporte">Soporte</a>
        <a href="#documentacion">Documentación</a>
        <a href="#version">Versión 1.0</a>
      </div>
    </footer>
  );
};
