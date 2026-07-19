import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'highlighted';
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  const classes = [styles.card, styles[variant], className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
