'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import styles from './emergency.module.css';

const EMERGENCY_CASES = [
  {
    id: 'degat_eaux',
    title: 'Dégât des eaux',
    icon: '💧',
    todo: '1. Coupez l\'arrivée d\'eau\n2. Protégez vos biens (surélevez, épongez)\n3. Prévenez vos voisins / syndic',
    whoToCall: 'Assistance Habitation AXA: 01 40 14 00 00',
    coverage: 'Couvert par le contrat Habitation MRH (Franchise 150€)'
  },
  {
    id: 'bris_glace',
    title: 'Bris de glace (Auto)',
    icon: '🚗',
    todo: '1. Sécurisez le véhicule\n2. Ne nettoyez pas les éclats (pour l\'expert si besoin)',
    whoToCall: 'Carglass (Partenaire MACIF): 0800 00 00 00',
    coverage: 'Couvert (Sans franchise si réparation, 50€ si remplacement)'
  },
  {
    id: 'vol',
    title: 'Vol / Cambriolage',
    icon: '🚨',
    todo: '1. Ne touchez à rien\n2. Allez porter plainte sous 24h\n3. Faites l\'inventaire',
    whoToCall: 'Police (17) puis Assurance Allianz: 09 70 80 90 90',
    coverage: 'Couvert jusqu\'à 15 000€ sur le mobilier'
  }
];

export default function EmergencyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Fiche d'Urgence</h1>
        <p className={styles.subtitle}>Vos réflexes et contacts utiles en cas de sinistre</p>
      </div>

      <div className={styles.actionArea}>
        <Button variant="emergency">Générer ma fiche PDF</Button>
      </div>

      <div className={styles.grid}>
        {EMERGENCY_CASES.map(c => (
          <Card key={c.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>{c.icon}</div>
              <h2 className={styles.cardTitle}>{c.title}</h2>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Que faire immédiatement ?</div>
              <div className={styles.sectionContent} style={{ whiteSpace: 'pre-line' }}>{c.todo}</div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Qui appeler ?</div>
              <div className={styles.sectionContent} style={{ fontWeight: 600 }}>{c.whoToCall}</div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Couverture</div>
              <div className={styles.sectionContent}>{c.coverage}</div>
            </div>

            <Button variant="emergency" className={styles.callButton} onClick={() => alert('Lancement de l\'appel...')}>
              Appeler l'assistance
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
