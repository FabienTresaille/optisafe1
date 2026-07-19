'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contracts', label: 'Mes Contrats' },
    { href: '/compare', label: 'Comparer' },
    { href: '/duplicates', label: 'Doublons' },
    { href: '/emergency', label: 'Fiche Urgence' },
    { href: '/search', label: 'Recherche IA' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoText}>Optisafe<span className={styles.logoDot}>.</span>fr</span>
          </Link>
        </div>

        <div className={styles.hamburger} onClick={toggleMenu}>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </div>

        <div className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.activeLink : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <div className={styles.userMenu}>
            <div className={styles.avatar}>U</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
