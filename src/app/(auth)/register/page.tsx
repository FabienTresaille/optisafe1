'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from '../Auth.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l\\'inscription');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={`${styles.card} animate-slideUp`}>
        <Link href="/" className={styles.logo}>
          Optisafe<span className={styles.logoDot}>.</span>fr
        </Link>
        <h1 className={styles.title}>Créer un compte</h1>
        
        {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input 
            label="Nom complet" 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean Dupont" 
            required 
          />
          <Input 
            label="Adresse email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.fr" 
            required 
          />
          <Input 
            label="Mot de passe" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            required 
          />
          <Button type="submit" variant="primary" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Création...' : 'S\'inscrire'}
          </Button>
        </form>
        
        <p className={styles.linkText}>
          Déjà un compte ?{' '}
          <Link href="/login" className={styles.link}>
            Se connecter
          </Link>
        </p>
      </Card>
    </div>
  );
}
