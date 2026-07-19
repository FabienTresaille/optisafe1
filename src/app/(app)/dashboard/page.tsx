import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  return (
    <div className={`container ${styles.dashboard}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bonjour, Jean 👋</h1>
          <p className={styles.subtitle}>Voici un résumé de vos assurances aujourd'hui.</p>
        </div>
        <Button variant="primary">+ Ajouter un contrat</Button>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIconWrapper}>📄</div>
          <div className={styles.statValue}>4</div>
          <div className={styles.statLabel}>Contrats analysés</div>
        </Card>
        <Card className={styles.statCard} variant="highlighted">
          <div className={styles.statIconWrapper}>⚠️</div>
          <div className={styles.statValue}>2</div>
          <div className={styles.statLabel}>Doublons détectés</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statIconWrapper}>🚑</div>
          <div className={styles.statValue}>1</div>
          <div className={styles.statLabel}>Fiche Urgence générée</div>
        </Card>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.activitySection}>
          <h2>Activité récente</h2>
          <Card className={styles.activityCard}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>✅</div>
              <div className={styles.activityDetails}>
                <h4>Contrat Auto Direct Assurance importé</h4>
                <p>Analyse terminée • Il y a 2 heures</p>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>⚠️</div>
              <div className={styles.activityDetails}>
                <h4>Doublon détecté : Responsabilité Civile</h4>
                <p>Présent dans Auto et Habitation • Il y a 2 heures</p>
              </div>
              <Badge variant="accent">À vérifier</Badge>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>✅</div>
              <div className={styles.activityDetails}>
                <h4>Contrat Habitation MAAF importé</h4>
                <p>Analyse terminée • Il y a 1 jour</p>
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.actionsSection}>
          <h2>Actions rapides</h2>
          <div className={styles.actionsGrid}>
            <Card className={styles.actionCard}>
              <h3>Comparer des contrats</h3>
              <p>Sélectionnez deux contrats pour voir les différences de garanties.</p>
              <Button variant="secondary" className={styles.actionBtn}>Comparer</Button>
            </Card>
            <Card className={styles.actionCard}>
              <h3>Fiche d'Urgence</h3>
              <p>Mettez à jour ou imprimez votre fiche d'urgence avec vos numéros vitaux.</p>
              <Button variant="emergency" className={styles.actionBtn}>Générer la fiche</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
