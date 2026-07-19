import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Footer } from '@/components/ui/Footer';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logo}>
            Optisafe<span className={styles.logoDot}>.</span>fr
          </div>
          <div className={styles.authLinks}>
            <Link href="/login" className={styles.loginLink}>Connexion</Link>
            <Link href="/register">
              <Button variant="primary">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className="animate-slideUp">Vos contrats d'assurance, <span className={styles.highlight}>enfin clairs.</span></h1>
          <p className={`${styles.subtitle} animate-slideUp`}>
            Comparez vos contrats, détectez les garanties en doublon et générez votre fiche d'urgence en quelques clics.
          </p>
          <div className={`${styles.heroActions} animate-fadeIn`}>
            <Link href="/register">
              <Button variant="primary" size="lg">Commencer gratuitement</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg">Se connecter</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Une gestion simplifiée et intelligente</h2>
          
          <div className={styles.grid}>
            <Card className={styles.featureCard}>
              <div className={styles.iconWrapper}>📄</div>
              <h3>Import & Analyse</h3>
              <p>Importez facilement vos contrats PDF. Notre IA analyse et extrait automatiquement les garanties clés.</p>
            </Card>
            
            <Card className={styles.featureCard} variant="highlighted">
              <div className={styles.iconWrapper}>🔍</div>
              <h3>Détection de doublons</h3>
              <p>Arrêtez de payer deux fois pour la même chose. Nous identifions les garanties superposées entre vos contrats.</p>
            </Card>
            
            <Card className={styles.featureCard}>
              <div className={styles.iconWrapper}>🚑</div>
              <h3>Fiche d'Urgence</h3>
              <p>Générez une carte d'urgence avec les numéros d'assistance et numéros de contrat, prête à être imprimée ou sauvegardée sur mobile.</p>
            </Card>
            
            <Card className={styles.featureCard}>
              <div className={styles.iconWrapper}>🤖</div>
              <h3>Recherche IA</h3>
              <p>Posez vos questions en langage naturel : "Suis-je couvert si je perds mes clés de voiture ?" Notre IA vous répond.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Prêt à optimiser vos assurances ?</h2>
          <p>Rejoignez des milliers d'utilisateurs qui économisent sur leurs assurances chaque année.</p>
          <Link href="/register">
            <Button variant="emergency" size="lg">Créer mon compte maintenant</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
