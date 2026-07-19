import { ContractType, CrossTag, ExtractedGuarantee, DuplicateResult } from '../taxonomy';

export interface GuaranteeInput {
  contractId: string;
  contractType: ContractType;
  contractName: string;
  guarantee: ExtractedGuarantee;
}

/**
 * Detects potential overlapping or duplicate guarantees across different contracts
 * based on cross-tags and a similarity score.
 */
export function detectDuplicates(guarantees: GuaranteeInput[]): DuplicateResult[] {
  const duplicates: DuplicateResult[] = [];
  const tagGroups: Record<string, GuaranteeInput[]> = {};

  // Group all guarantees by their crossTags
  for (const g of guarantees) {
    for (const tag of g.guarantee.crossTags) {
      if (!tagGroups[tag]) {
        tagGroups[tag] = [];
      }
      tagGroups[tag].push(g);
    }
  }

  // Evaluate overlaps within each tag group
  for (const tagKey of Object.keys(tagGroups)) {
    const tag = tagKey as CrossTag;
    const group = tagGroups[tag];

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const itemA = group[i];
        const itemB = group[j];

        // Only compare guarantees from different contracts
        if (itemA.contractId === itemB.contractId) {
          continue;
        }

        const score = calculateOverlapScore(itemA.guarantee, itemB.guarantee);

        if (score >= 0.5) {
          // Check if this pair (A, B) or (B, A) is already recorded
          const exists = duplicates.some(d => 
            (d.guaranteeA.contractId === itemA.contractId && d.guaranteeA.guarantee.taxonomyId === itemA.guarantee.taxonomyId &&
             d.guaranteeB.contractId === itemB.contractId && d.guaranteeB.guarantee.taxonomyId === itemB.guarantee.taxonomyId) ||
            (d.guaranteeA.contractId === itemB.contractId && d.guaranteeA.guarantee.taxonomyId === itemB.guarantee.taxonomyId &&
             d.guaranteeB.contractId === itemA.contractId && d.guaranteeB.guarantee.taxonomyId === itemA.guarantee.taxonomyId)
          );

          if (!exists) {
            duplicates.push({
              guaranteeA: itemA,
              guaranteeB: itemB,
              sharedTag: tag,
              overlapScore: score,
              explanation: generateExplanation(itemA.guarantee, itemB.guarantee, score)
            });
          }
        }
      }
    }
  }

  // Sort by highest overlap score first
  return duplicates.sort((a, b) => b.overlapScore - a.overlapScore);
}

function calculateOverlapScore(a: ExtractedGuarantee, b: ExtractedGuarantee): number {
  if (!a.covered || !b.covered) return 0;

  // Base score for having the same cross tag and both being covered
  let score = 0.5;

  // Similar ceilings (+0.2)
  if (a.ceiling !== null && b.ceiling !== null && a.ceiling > 0 && b.ceiling > 0) {
    const diff = Math.abs(a.ceiling - b.ceiling) / Math.max(a.ceiling, b.ceiling);
    if (diff <= 0.3) score += 0.2;
  }

  // Similar deductibles (+0.15)
  if (a.deductible !== null && b.deductible !== null && a.deductibleType === b.deductibleType) {
    if (a.deductible === 0 && b.deductible === 0) {
      score += 0.15;
    } else {
      const maxDed = Math.max(a.deductible, b.deductible);
      if (maxDed > 0) {
        const diff = Math.abs(a.deductible - b.deductible) / maxDed;
        if (diff <= 0.3) score += 0.15;
      }
    }
  }

  // Similar conditions (+0.15)
  if (a.conditions && b.conditions && a.conditions.toLowerCase().trim() === b.conditions.toLowerCase().trim()) {
    score += 0.15;
  }

  return Math.min(score, 1.0);
}

function generateExplanation(a: ExtractedGuarantee, b: ExtractedGuarantee, score: number): string {
  const percentage = Math.round(score * 100);
  return `Chevauchement probable (${percentage}%). Les garanties "${a.label}" et "${b.label}" couvrent des risques similaires.`;
}
