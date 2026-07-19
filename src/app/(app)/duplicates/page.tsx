'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import styles from './duplicates.module.css';

interface Duplicate {
  id: string;
  status: 'new' | 'seen' | 'ignored' | 'resolved';
  overlapScore: number;
  sharedTag: string;
  contractA: {
    insurer: string;
    type: string;
    guaranteeLabel: string;
    ceiling?: string;
  };
  contractB: {
    insurer: string;
    type: string;
    guaranteeLabel: string;
    ceiling?: string;
  };
}

export default function DuplicatesPage() {
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'seen' | 'ignored' | 'resolved'>('all');

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    try {
      const res = await fetch('/api/duplicates');
      if (res.ok) {
        const data = await res.json();
        setDuplicates(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/duplicates', { method: 'POST' });
      if (res.ok) {
        await fetchDuplicates();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setScanning(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/duplicates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setDuplicates(prev => prev.map(d => d.id === id ? { ...d, status: status as any } : d));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredDuplicates = duplicates.filter(d => filter === 'all' ? true : d.status === filter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Doublons détectés</h1>
        <Button variant="primary" onClick={handleScan} isLoading={scanning}>
          Lancer un scan
        </Button>
      </div>

      <div className={styles.filters}>
        {(['all', 'new', 'seen', 'ignored', 'resolved'] as const).map(f => (
          <button 
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tous' : f === 'new' ? 'Nouveaux' : f === 'seen' ? 'Vus' : f === 'ignored' ? 'Ignorés' : 'Résolus'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Chargement...</div>
      ) : filteredDuplicates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '8px' }}>
          Aucun doublon trouvé pour ce filtre.
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredDuplicates.map(d => (
            <Card key={d.id} className={styles.duplicateCard}>
              <div className={styles.cardHeader}>
                <Badge variant="accent" style={{ backgroundColor: 'var(--color-secondary)' }}>{d.sharedTag}</Badge>
                <div className={styles.overlapInfo}>
                  <span className={styles.overlapText}>{d.overlapScore}% de similarité</span>
                  <div className={styles.overlapBarContainer}>
                    <div className={styles.overlapBar} style={{ width: `${d.overlapScore}%` }}></div>
                  </div>
                </div>
              </div>

              <div className={styles.comparisonArea}>
                <div className={styles.contractSide}>
                  <div className={styles.contractName}>{d.contractA.insurer} <Badge variant="secondary">{d.contractA.type}</Badge></div>
                  <div className={styles.guaranteeLabel}>{d.contractA.guaranteeLabel}</div>
                  {d.contractA.ceiling && <div className={styles.guaranteeDetails}>Plafond: {d.contractA.ceiling}</div>}
                </div>

                <div className={styles.vsBadge}>
                  <div className={styles.vsCircle}>VS</div>
                </div>

                <div className={styles.contractSide}>
                  <div className={styles.contractName}>{d.contractB.insurer} <Badge variant="secondary">{d.contractB.type}</Badge></div>
                  <div className={styles.guaranteeLabel}>{d.contractB.guaranteeLabel}</div>
                  {d.contractB.ceiling && <div className={styles.guaranteeDetails}>Plafond: {d.contractB.ceiling}</div>}
                </div>
              </div>

              <div className={styles.actions}>
                {d.status !== 'ignored' && (
                  <Button variant="ghost" onClick={() => updateStatus(d.id, 'ignored')}>Ignorer</Button>
                )}
                {d.status !== 'resolved' && (
                  <Button variant="secondary" onClick={() => updateStatus(d.id, 'resolved')}>Marquer comme résolu</Button>
                )}
                {d.status === 'new' && (
                  <Button variant="primary" onClick={() => updateStatus(d.id, 'seen')}>Marquer comme vu</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
