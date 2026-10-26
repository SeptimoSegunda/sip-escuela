import type { Metadata } from 'next';
import LoginCard from '@/components/login/LoginCard';
import LoginPageGuard from './LoginPageGuard';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Iniciar Sesión — SIP',
  description: 'Accede al Sistema de Préstamos Escolares con tus credenciales de turno.',
};

export default function LoginPage() {
  return (
    <LoginPageGuard>
      <main className={styles.loginPageWrapper}>
        <LoginCard />
      </main>
    </LoginPageGuard>
  );
}
