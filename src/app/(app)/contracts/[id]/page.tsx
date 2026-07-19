'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import styles from './detail.module.css';

interface Guarantee {
  id: string;
  label: string;
  status: 'covered' | 'excluded' | 'optional';
  ceiling?: string;
  deductible?: string;
  tags: string[];
}

interface Contract {
  id: string;
  type: string;
  insurer: string;
  number?: string;
  premium?: number;
  startDate?: string;
  endDate?: string;
  guarantees: Guarantee[];
}

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContract() {
      try {
        const res = await fetch(`/api/contracts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setContract(data);
        }
      } catch (error) {
        console.error('Failed to fetch contract:', error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchContract();
  }, [id]);

  if (loading) return <div className={styles.loading}>Chargement du contrat...</div>;
  if (!contract) return <div className={styles.error}>Contrat introuvable.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            {contract.insurer}
            <Badge variant="primary">{contract.type}</Badge>
          </h1>
          {contract.number && <p className={styles.subtitle}>N° {contract.number}</p>}
        </div>
        <div className={styles.actions}>
          <Button variant="secondary">Modifier</Button>
          <Button variant="ghost" style={{ color: 'red', borderColor: 'red' }}>Supprimer</Button>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <Card className={styles.infoCard}>
          <div className={styles.infoLabel}>Prime mensuelle</div>
          <div className={styles.infoValue}>{contract.premium ? `${contract.premium} €` : '-'}</div>
        </Card>
        <Card className={styles.infoCard}>
          <div className={styles.infoLabel}>Date d'effet</div>
          <div className={styles.infoValue}>{contract.startDate || '-'}</div>
        </Card>
        <Card className={styles.infoCard}>
          <div className={styles.infoLabel}>Date d'échéance</div>
          <div className={styles.infoValue}>{contract.endDate || '-'}</div>
        </Card>
      </div>

      <div className={styles.guaranteesSection}>
        <h2 className={styles.sectionTitle}>Garanties</h2>
        {contract.guarantees?.length > 0 ? (
          <div className={styles.guaranteeList}>
            {contract.guarantees.map((g) => (
              <Card key={g.id} className={styles.guaranteeCard}>
                <div className={styles.guaranteeInfo}>
                  <div className={styles.guaranteeLabel}>
                    {g.label}
                    <Badge variant={g.status === 'covered' ? 'accent' : 'default'} style={g.status === 'covered' ? { backgroundColor: 'var(--color-secondary)' } : {}}>
                      {g.status === 'covered' ? 'Couvert' : g.status === 'excluded' ? 'Exclu' : 'Optionnel'}
                    </Badge>
                  </div>
                  <div className={styles.guaranteeDetails}>
                    {g.ceiling && <span>Plafond : {g.ceiling}</span>}
                    {g.deductible && <span>Franchise : {g.deductible}</span>}
                  </div>
                </div>
                {g.tags && g.tags.length > 0 && (
                  <div className={styles.tags}>
                    {g.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p>Aucune garantie détaillée pour ce contrat.</p>
        )}
      </div>
    </div>
  );
}
