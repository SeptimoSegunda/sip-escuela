'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLock,
  faCircleExclamation,
  faCheck,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import InputField from './InputField';
import { guardarSesion } from '@/hooks/useAuth';
import styles from './LoginForm.module.css';

type Turno = 'Turno Mañana' | 'Turno Tarde';

function resolverTurno(usuario: string, contrasena: string): Turno | null {
  const u = usuario.trim().toLowerCase();
  const p = contrasena.trim();

  if ((u === 'adminmañana' || u === 'adminmanana') && p === '1234') {
    return 'Turno Mañana';
  }
  if (u === 'admintarde' && p === '1234') {
    return 'Turno Tarde';
  }
  return null;
}

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [assignedTurno, setAssignedTurno] = useState<Turno | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Por favor, ingresa tu usuario.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }

    const turno = resolverTurno(username, password);
    if (!turno) {
      setError('Credenciales incorrectas. Consulta los datos de acceso al pie.');
      return;
    }

    setAssignedTurno(turno);
    setIsLoading(true);

    setTimeout(() => {
      try {
        guardarSesion(turno, username.trim().toLowerCase());
      } catch (err) {
        console.error('Error al guardar en localStorage', err);
      }

      setIsLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className={styles.errorBanner} role="alert">
          <FontAwesomeIcon icon={faCircleExclamation} />
          <span>{error}</span>
        </div>
      )}

      <InputField
        id="inputUsername"
        label="Usuario"
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (error) setError(null);
        }}
        autoComplete="username"
        icon={<FontAwesomeIcon icon={faUser} />}
      />

      <InputField
        id="inputPassword"
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (error) setError(null);
        }}
        autoComplete="current-password"
        icon={<FontAwesomeIcon icon={faLock} />}
      />

      <button
        type="submit"
        id="btnSubmitLogin"
        className={styles.btnSubmitLogin}
        disabled={isLoading || isSuccess}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span>Verificando credenciales...</span>
          </>
        ) : isSuccess ? (
          <>
            <FontAwesomeIcon icon={faCheck} />
            <span>¡Ingreso correcto! Entrando al sistema...</span>
          </>
        ) : (
          <>
            <span>Iniciar Sesión</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </>
        )}
      </button>

      {isSuccess && assignedTurno && (
        <div className={styles.successBanner} role="status">
          <span>
            Ingresando con <strong>{assignedTurno}</strong>
          </span>
        </div>
      )}
    </form>
  );
}
