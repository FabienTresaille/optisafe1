export type ContractType = 'MRH' | 'AUTO' | 'SANTE' | 'CB' | 'GAV';

export type CrossTag = 
  | 'RESPONSABILITE_CIVILE'
  | 'ACCIDENT_CORPOREL'
  | 'VOL'
  | 'VOYAGE'
  | 'PROTECTION_JURIDIQUE'
  | 'ASSISTANCE'
  | 'BRIS'
  | 'CATASTROPHE_NAT';

export type CeilingUnit = 'per_event' | 'per_year';
export type DeductibleType = 'fixed' | 'percentage';

/**
 * Defines a standard taxonomy entry for the guarantee catalog.
 */
export interface TaxonomyEntry {
  id: string;           // Ex: "MRH.DOMMAGES.INCENDIE"
  family: ContractType;
  category: string;     // Ex: "Dommages aux biens"
  label: string;        // Ex: "Incendie / Explosion"
  crossTags: CrossTag[];
  description: string;  // Help text for user
}

/**
 * Represents a specific guarantee extracted from a contract.
 */
export interface ExtractedGuarantee {
  taxonomyId: string;
  label: string;
  crossTags: CrossTag[];
  covered: boolean;
  ceiling: number | null;
  ceilingUnit: CeilingUnit | null;
  deductible: number | null;
  deductibleType: DeductibleType | null;
  waitingPeriod: number | null;
  conditions: string | null;
  sourceClause: string | null;
}

/**
 * Result object for identifying overlapping/duplicate guarantees.
 */
export interface DuplicateResult {
  guaranteeA: { contractId: string; guarantee: ExtractedGuarantee; contractName: string; contractType: ContractType };
  guaranteeB: { contractId: string; guarantee: ExtractedGuarantee; contractName: string; contractType: ContractType };
  sharedTag: CrossTag;
  overlapScore: number; // 0.0 to 1.0
  explanation: string;
}

/**
 * Contextual object for a contract's extracted guarantee.
 */
export interface ContractGuaranteeContext {
  contractId: string;
  guarantee: ExtractedGuarantee;
  contractName: string;
  contractType: ContractType;
}

export interface ContractData {
  id: string;
  type: ContractType;
  guarantees: ExtractedGuarantee[];
}

export interface ComparisonRow {
  taxonomyId: string;
  label: string;
  family: ContractType;
  category: string;
  contractGuarantees: Record<string, ExtractedGuarantee | null>;
}

export interface ComparisonResult {
  contracts: ContractData[];
  rows: ComparisonRow[];
}
