'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import styles from './new.module.css';

export default function NewContractPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'import' | 'manual'>('import');
  const [loading, setLoading] = useState(false);

  // Manual Form State
  const [insurer, setInsurer] = useState('');
  const [type, setType] = useState('MRH');
  const [number, setNumber] = useState('');
  const [premium, setPremium] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Dummy submit
    setTimeout(() => {
      setLoading(false);
      router.push('/contracts');
    }, 1500);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insurer, type, number, premium: parseFloat(premium), startDate, endDate
        })
      });
      if (res.ok) {
        router.push('/contracts');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ajouter un contrat</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'import' ? styles.active : ''}`}
          onClick={() => setTab('import')}
        >
          Import PDF
        </button>
        <button
          className={`${styles.tab} ${tab === 'manual' ? styles.active : ''}`}
          onClick={() => setTab('manual')}
        >
          Saisie manuelle
        </button>
      </div>

      <Card className={styles.card}>
        {tab === 'import' && (
          <form onSubmit={handleImportSubmit} className={styles.form}>
            <div className={styles.dropzone}>
              <p>Glissez-déposez votre contrat PDF ici</p>
              <Button type="button" variant="secondary">Parcourir les fichiers</Button>
            </div>
            
            <div className={styles.row}>
              <div style={{flex: 1}}>
                <label className={styles.sectionTitle}>Type de contrat</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                  <option value="MRH">Habitation (MRH)</option>
                  <option value="AUTO">Automobile</option>
                  <option value="SANTE">Santé</option>
                  <option value="GAV">Garantie Accidents de la Vie (GAV)</option>
                </select>
              </div>
              <Input
                label="Nom de l'assureur"
                value={insurer}
                onChange={(e) => setInsurer(e.target.value)}
                placeholder="Ex: AXA, Allianz..."
                required
              />
            </div>

            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => router.push('/contracts')}>Annuler</Button>
              <Button type="submit" variant="primary" isLoading={loading}>Analyser le contrat</Button>
            </div>
          </form>
        )}

        {tab === 'manual' && (
          <form onSubmit={handleManualSubmit} className={styles.form}>
            <div className={styles.row}>
              <Input
                label="Nom de l'assureur"
                value={insurer}
                onChange={(e) => setInsurer(e.target.value)}
                required
              />
              <div style={{flex: 1}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Type de contrat</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                  <option value="MRH">Habitation (MRH)</option>
                  <option value="AUTO">Automobile</option>
                  <option value="SANTE">Santé</option>
                  <option value="GAV">Garantie Accidents de la Vie (GAV)</option>
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <Input
                label="Numéro de contrat"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
              <Input
                label="Prime mensuelle (€)"
                type="number"
                step="0.01"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
              />
            </div>

            <div className={styles.row}>
              <Input
                label="Date de début"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Date de fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={() => router.push('/contracts')}>Annuler</Button>
              <Button type="submit" variant="primary" isLoading={loading}>Enregistrer</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
