'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import styles from './contracts.module.css';

interface Contract {
  id: string;
  type: string;
  insurer: string;
  premium: number;
}

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const res = await fetch('/api/contracts');
        if (res.ok) {
          const data = await res.json();
          setContracts(data);
        }
      } catch (error) {
        console.error('Failed to fetch contracts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchContracts();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Chargement de vos contrats...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mes Contrats</h1>
        <Link href="/contracts/new">
          <Button variant="primary">Ajouter un contrat</Button>
        </Link>
      </div>

      {contracts.length === 0 ? (
        <div className={styles.noContracts}>
          <p>Vous n'avez pas encore de contrats.</p>
          <br />
          <Link href="/contracts/new">
            <Button variant="secondary">Ajouter mon premier contrat</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {contracts.map((contract) => (
            <Card
              key={contract.id}
              className={styles.card}
              onClick={() => router.push(`/contracts/${contract.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <Badge variant="primary">{contract.type}</Badge>
                </div>
                <div className={styles.insurer}>{contract.insurer}</div>
                <div className={styles.premium}>
                  {contract.premium ? `${contract.premium} € / mois` : 'Prime inconnue'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
