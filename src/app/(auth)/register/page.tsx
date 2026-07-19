import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from '../Auth.module.css';

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <Card className={`${styles.card} animate-slideUp`}>
        <Link href="/" className={styles.logo}>
          Optisafe<span className={styles.logoDot}>.</span>fr
        </Link>
        <h1 className={styles.title}>Créer un compte</h1>
        
        <form className={styles.form}>
          <Input 
            label="Nom complet" 
            type="text" 
            placeholder="Jean Dupont" 
            required 
          />
          <Input 
            label="Adresse email" 
            type="email" 
            placeholder="vous@exemple.fr" 
            required 
          />
          <Input 
            label="Mot de passe" 
            type="password" 
            placeholder="••••••••" 
            required 
          />
          <Link href="/dashboard" className={styles.submitBtn}>
            <Button type="button" variant="primary" className={styles.submitBtn}>S'inscrire</Button>
          </Link>
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
