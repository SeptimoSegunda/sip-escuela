import Image from 'next/image';
import LoginForm from './LoginForm';
import styles from './LoginCard.module.css';

export default function LoginCard() {
  return (
    <div className={styles.loginCard}>
      <div className={styles.loginHeader}>
        <Image
          src="/logo.png"
          alt="Logo SIP"
          width={72}
          height={72}
          className={styles.logoImgSip}
          priority
        />
        <h1 className={styles.loginTitle}>SIP</h1>
        <p className={styles.loginSubtitle}>Sistema de Préstamos Escolares</p>
      </div>

      <LoginForm />
    </div>
  );
}
