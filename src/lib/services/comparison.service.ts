import { ContractType, ExtractedGuarantee, ComparisonResult, ComparisonRow, TAXONOMY_BY_FAMILY, ContractData } from '../taxonomy';

/**
 * Compares multiple contracts by aligning their guarantees against the central taxonomy.
 */
export function compareContracts(contracts: ContractData[]): ComparisonResult {
  const result: ComparisonResult = {
    contracts,
    rows: []
  };

  if (!contracts || contracts.length === 0) {
    return result;
  }

  // Find all unique families among the provided contracts
  const families = new Set<ContractType>();
  for (const contract of contracts) {
    families.add(contract.type);
  }

  // Build comparison rows for each taxonomy entry relevant to these families
  for (const family of Array.from(families)) {
    const taxonomyEntries = TAXONOMY_BY_FAMILY[family] || [];

    for (const entry of taxonomyEntries) {
      const row: ComparisonRow = {
        taxonomyId: entry.id,
        label: entry.label,
        family: entry.family,
        category: entry.category,
        contractGuarantees: {}
      };

      let hasAtLeastOneCovered = false;

      // Populate guarantee data for each contract
      for (const contract of contracts) {
        if (contract.type === family) {
          const guarantee = contract.guarantees.find(g => g.taxonomyId === entry.id);
          row.contractGuarantees[contract.id] = guarantee || null;
          
          if (guarantee && guarantee.covered) {
            hasAtLeastOneCovered = true;
          }
        } else {
           // Contract is of a different family, so this taxonomy entry doesn't apply
           row.contractGuarantees[contract.id] = null;
        }
      }

      // We only include rows where the guarantee is explicitly listed in the taxonomy
      // even if no contract covers it, to highlight what's missing.
      result.rows.push(row);
    }
  }

  return result;
}
