import React from 'react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logo}>
          Optisafe<span className={styles.logoDot}>.</span>fr
        </div>
        <p className={styles.text}>
          © {new Date().getFullYear()} Optisafe.fr. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
