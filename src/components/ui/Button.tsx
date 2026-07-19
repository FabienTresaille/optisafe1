import React from 'react';
import Link from 'next/link';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  href?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  href,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    isLoading ? styles.loading : '',
    className
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {isLoading ? <span className={styles.spinner}></span> : children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <span className={styles.spinner}></span> : children}
    </button>
  );
}
