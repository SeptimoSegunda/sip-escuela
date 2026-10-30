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
import { api } from '@/lib/api';
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    try {
      // Validar el turno contra el backend vía /api/turno/actual
      await api.validarTurnoHeader(turno === 'Turno Mañana' ? 'mañana' : 'tarde');

      guardarSesion(turno, username.trim().toLowerCase());
      setIsLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
    } catch (err) {
      setIsLoading(false);
      setError('Turno no válido o no configurado en el sistema.');
      console.error('[Login] Error validando turno:', err);
    }
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
