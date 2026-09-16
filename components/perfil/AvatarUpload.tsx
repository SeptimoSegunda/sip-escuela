"use client";

import React, { useRef } from "react";
import styles from "./perfil.module.css";

interface AvatarUploadProps {
  fotoSrc: string;
  onFotoChange: (base64: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ fotoSrc, onFotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, elegí un archivo de imagen válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        onFotoChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.avatarWrap}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fotoSrc}
        alt="Foto de perfil del socio"
        className={styles.avatar}
      />
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => fileInputRef.current?.click()}
        title="Cambiar foto de perfil"
        aria-label="Cambiar foto de perfil"
      >
        📷
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />
    </div>
  );
};
