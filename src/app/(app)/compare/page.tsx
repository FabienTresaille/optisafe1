'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import styles from './compare.module.css';

interface Contract {
  id: string;
  type: string;
  insurer: string;
}

interface ComparisonResult {
  guarantees: {
    label: string;
    isMatch: boolean;
    values: Record<string, { status: string; ceiling?: string; deductible?: string }>;
  }[];
}

export default function ComparePage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const res = await fetch('/api/contracts');
        if (res.ok) {
          const data = await res.json();
          setContracts(data.contracts || []);
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchContracts();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setComparing(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractIds: selectedIds })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (error) {
      console.error('Error comparing:', error);
    } finally {
      setComparing(false);
    }
  };

  if (loading) return <div style={{padding: '4rem', textAlign: 'center'}}>Chargement...</div>;

  const selectedContracts = contracts.filter(c => selectedIds.includes(c.id));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Comparer mes contrats</h1>
      </div>

      {!result && (
        <div className={styles.selectionArea}>
          <p>Sélectionnez au moins 2 contrats pour les comparer :</p>
          <div className={styles.selectionGrid}>
            {contracts.map(c => (
              <Card 
                key={c.id} 
                className={`${styles.contractCheckboxCard} ${selectedIds.includes(c.id) ? styles.selected : ''}`}
                onClick={() => toggleSelection(c.id)}
              >
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={selectedIds.includes(c.id)}
                  onChange={() => {}} // handled by parent div onClick
                />
                <div>
                  <strong>{c.insurer}</strong>
                  <br />
                  <Badge variant="secondary" style={{marginTop: '0.5rem'}}>{c.type}</Badge>
                </div>
              </Card>
            ))}
          </div>
          <div className={styles.compareButtonArea}>
            <Button 
              variant="primary" 
              onClick={handleCompare} 
              disabled={selectedIds.length < 2 || comparing}
              isLoading={comparing}
            >
              Lancer la comparaison
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>Résultats de la comparaison</h2>
            <Button variant="ghost" onClick={() => setResult(null)}>Nouvelle comparaison</Button>
          </div>
          
          <div className={styles.comparisonTableWrapper}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Garantie</th>
                  {selectedContracts.map(c => (
                    <th key={c.id}>{c.insurer} ({c.type})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.guarantees.map((g, idx) => (
                  <tr key={idx} className={g.isMatch ? styles.matchRow : ''}>
                    <td style={{ fontWeight: 500 }}>{g.label}</td>
                    {selectedContracts.map(c => {
                      const val = g.values[c.id];
                      return (
                        <td key={c.id}>
                          {val ? (
                            <div>
                              <span className={val.status === 'covered' ? styles.covered : styles.excluded}>
                                {val.status === 'covered' ? '✓ Couvert' : '✗ Exclu'}
                              </span>
                              {(val.ceiling || val.deductible) && (
                                <span className={styles.details}>
                                  {val.ceiling && `Plafond: ${val.ceiling}`}
                                  {val.ceiling && val.deductible && ' | '}
                                  {val.deductible && `Franchise: ${val.deductible}`}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#ccc' }}>Non mentionné</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
