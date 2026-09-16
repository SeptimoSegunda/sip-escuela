"use client";

import React, { useEffect } from "react";
import { useApp } from "@/store/AppContext";

interface ModalWrapperProps {
  id: string;
  title: string;
  subtitle?: string;
  isLarge?: boolean;
  children: React.ReactNode;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  id,
  title,
  subtitle,
  isLarge = false,
  children
}) => {
  const { closeModal } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  return (
    <div
      className="modal-overlay"
      id={id}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className={`modal-card ${isLarge ? "modal-card--large" : ""}`}>
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{subtitle}</p>}
          </div>
          <button
            className="close-btn btnCerrarModal"
            aria-label="Cerrar modal"
            onClick={closeModal}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
