'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import styles from './InputField.module.css';

interface InputFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'password' | 'email';
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
}

export default function InputField({
  id,
  label,
  type = 'text',
  icon,
  value,
  onChange,
  placeholder,
  autoComplete,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={styles.inputFieldGroup}>
      <label htmlFor={id} className={styles.inputLabel}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.inputIconLeft}>{icon}</span>}
        <input
          id={id}
          type={inputType}
          className={styles.loginInput}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.inputBtnToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        )}
      </div>
    </div>
  );
}
