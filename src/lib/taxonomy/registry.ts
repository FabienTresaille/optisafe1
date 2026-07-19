import { TaxonomyEntry, ContractType, CrossTag } from './types';

export const CROSS_TAG_LABELS: Record<CrossTag, string> = {
  RESPONSABILITE_CIVILE: 'Responsabilité Civile',
  ACCIDENT_CORPOREL: 'Accident Corporel',
  VOL: 'Vol',
  VOYAGE: 'Voyage',
  PROTECTION_JURIDIQUE: 'Protection Juridique',
  ASSISTANCE: 'Assistance',
  BRIS: 'Bris',
  CATASTROPHE_NAT: 'Catastrophe Naturelle'
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  MRH: 'Habitation',
  AUTO: 'Auto',
  SANTE: 'Santé',
  CB: 'Carte Bancaire',
  GAV: 'Garantie Accidents de la Vie'
};

const MRH_ENTRIES: TaxonomyEntry[] = [
  { id: 'MRH.DOMMAGES.INCENDIE', family: 'MRH', category: 'Dommages aux biens', label: 'Incendie / Explosion', crossTags: [], description: 'Dommages causés par un incendie ou une explosion' },
  { id: 'MRH.DOMMAGES.DEGAT_EAUX', family: 'MRH', category: 'Dommages aux biens', label: 'Dégât des eaux', crossTags: [], description: 'Dommages liés à l\'eau' },
  { id: 'MRH.DOMMAGES.CATASTROPHE_NAT', family: 'MRH', category: 'Dommages aux biens', label: 'Catastrophe naturelle', crossTags: ['CATASTROPHE_NAT'], description: 'Catastrophes naturelles' },
  { id: 'MRH.DOMMAGES.TEMPETE', family: 'MRH', category: 'Dommages aux biens', label: 'Tempête / Grêle / Neige', crossTags: [], description: 'Tempêtes, grêle, poids de la neige' },
  { id: 'MRH.DOMMAGES.VOL', family: 'MRH', category: 'Dommages aux biens', label: 'Vol / Cambriolage', crossTags: ['VOL'], description: 'Vol ou tentative de vol' },
  { id: 'MRH.DOMMAGES.VANDALISME', family: 'MRH', category: 'Dommages aux biens', label: 'Vandalisme', crossTags: [], description: 'Vandalisme à l\'intérieur ou l\'extérieur' },
  { id: 'MRH.DOMMAGES.BRIS_GLACE', family: 'MRH', category: 'Dommages aux biens', label: 'Bris de glace habitation', crossTags: ['BRIS'], description: 'Bris de vitres, miroirs, etc.' },
  { id: 'MRH.DOMMAGES.ELECTRIQUES', family: 'MRH', category: 'Dommages aux biens', label: 'Dommages électriques', crossTags: [], description: 'Surtensions électriques' },
  { id: 'MRH.RESPONSABILITE.RC_VIE_PRIVEE', family: 'MRH', category: 'Responsabilité', label: 'RC Vie Privée', crossTags: ['RESPONSABILITE_CIVILE'], description: 'Dommages causés aux tiers' },
  { id: 'MRH.RESPONSABILITE.RC_LOCATIVE', family: 'MRH', category: 'Responsabilité', label: 'RC Locative', crossTags: [], description: 'Responsabilité envers le propriétaire' },
  { id: 'MRH.RESPONSABILITE.RECOURS_VOISINS', family: 'MRH', category: 'Responsabilité', label: 'Recours des voisins et des tiers', crossTags: [], description: 'Dommages causés aux voisins' },
  { id: 'MRH.ASSISTANCE.RELOGEMENT', family: 'MRH', category: 'Assistance', label: 'Relogement temporaire', crossTags: ['ASSISTANCE'], description: 'Frais de relogement' },
  { id: 'MRH.ASSISTANCE.DEPANNAGE', family: 'MRH', category: 'Assistance', label: 'Dépannage d\'urgence', crossTags: ['ASSISTANCE'], description: 'Dépannage plomberie, serrurerie, etc.' },
  { id: 'MRH.ASSISTANCE.GARDE', family: 'MRH', category: 'Assistance', label: 'Garde des enfants / animaux', crossTags: ['ASSISTANCE'], description: 'Frais de garde' },
  { id: 'MRH.JURIDIQUE.VIE_PRIVEE', family: 'MRH', category: 'Protection Juridique', label: 'Litiges vie privée', crossTags: ['PROTECTION_JURIDIQUE'], description: 'Défense juridique' },
  { id: 'MRH.JURIDIQUE.HABITATION', family: 'MRH', category: 'Protection Juridique', label: 'Litiges habitation', crossTags: ['PROTECTION_JURIDIQUE'], description: 'Défense pour le logement' },
  { id: 'MRH.COUVERTURE.PISCINE', family: 'MRH', category: 'Options', label: 'Piscine / Dépendances', crossTags: [], description: 'Couverture piscine et dépendances' },
  { id: 'MRH.COUVERTURE.JARDIN', family: 'MRH', category: 'Options', label: 'Jardin / Aménagements extérieurs', crossTags: [], description: 'Aménagements extérieurs' },
  { id: 'MRH.COUVERTURE.OBJETS_VALEUR', family: 'MRH', category: 'Options', label: 'Objets de valeur', crossTags: ['VOL'], description: 'Couverture des objets de valeur' },
  { id: 'MRH.COUVERTURE.TELETRAVAIL', family: 'MRH', category: 'Options', label: 'Télétravail', crossTags: [], description: 'Matériel professionnel à domicile' },
  { id: 'MRH.COUVERTURE.VILLEGIATURE', family: 'MRH', category: 'Options', label: 'Villégiature', crossTags: ['VOYAGE'], description: 'Location de vacances' }
];

const AUTO_ENTRIES: TaxonomyEntry[] = [
  { id: 'AUTO.TIERS.RC', family: 'AUTO', category: 'Tiers', label: 'Responsabilité Civile Auto', crossTags: ['RESPONSABILITE_CIVILE'], description: 'Couverture obligatoire des dommages causés aux tiers' },
  { id: 'AUTO.DOMMAGES.TOUS_RISQUES', family: 'AUTO', category: 'Dommages', label: 'Tous risques collision', crossTags: [], description: 'Dommages au véhicule' },
  { id: 'AUTO.DOMMAGES.VOL', family: 'AUTO', category: 'Dommages', label: 'Vol / Tentative de vol', crossTags: ['VOL'], description: 'Vol du véhicule' },
  { id: 'AUTO.DOMMAGES.INCENDIE', family: 'AUTO', category: 'Dommages', label: 'Incendie', crossTags: [], description: 'Incendie du véhicule' },
  { id: 'AUTO.DOMMAGES.BRIS_GLACE', family: 'AUTO', category: 'Dommages', label: 'Bris de glace auto', crossTags: ['BRIS'], description: 'Pare-brise et vitres' },
  { id: 'AUTO.DOMMAGES.CATASTROPHE_NAT', family: 'AUTO', category: 'Dommages', label: 'Catastrophe naturelle / Tempête', crossTags: ['CATASTROPHE_NAT'], description: 'Catastrophes naturelles' },
  { id: 'AUTO.DOMMAGES.ANIMAUX', family: 'AUTO', category: 'Dommages', label: 'Dommages animaux', crossTags: [], description: 'Choc avec un animal' },
  { id: 'AUTO.PERSONNES.CONDUCTEUR', family: 'AUTO', category: 'Personnes', label: 'Garantie du conducteur', crossTags: ['ACCIDENT_CORPOREL'], description: 'Blessures du conducteur' },
  { id: 'AUTO.PERSONNES.PASSAGERS', family: 'AUTO', category: 'Personnes', label: 'Individuelle accident passagers', crossTags: ['ACCIDENT_CORPOREL'], description: 'Blessures des passagers' },
  { id: 'AUTO.ASSISTANCE.DEPANNAGE', family: 'AUTO', category: 'Assistance', label: 'Dépannage / Remorquage', crossTags: ['ASSISTANCE'], description: 'Dépannage en cas de panne' },
  { id: 'AUTO.ASSISTANCE.VEHICULE_REMPLACEMENT', family: 'AUTO', category: 'Assistance', label: 'Véhicule de remplacement', crossTags: ['ASSISTANCE'], description: 'Prêt de véhicule' },
  { id: 'AUTO.ASSISTANCE.RAPATRIEMENT', family: 'AUTO', category: 'Assistance', label: 'Rapatriement', crossTags: ['ASSISTANCE', 'VOYAGE'], description: 'Rapatriement des personnes' },
  { id: 'AUTO.JURIDIQUE.DEFENSE', family: 'AUTO', category: 'Protection Juridique', label: 'Défense pénale et recours', crossTags: ['PROTECTION_JURIDIQUE'], description: 'Défense en cas d\'accident' },
  { id: 'AUTO.AUTRES.CONTENU', family: 'AUTO', category: 'Autres', label: 'Contenu du véhicule', crossTags: ['VOL'], description: 'Effets personnels dans le véhicule' },
  { id: 'AUTO.AUTRES.EQUIPEMENTS', family: 'AUTO', category: 'Autres', label: 'Équipements / Accessoires', crossTags: [], description: 'Accessoires hors-série' }
];

const SANTE_ENTRIES: TaxonomyEntry[] = [
  { id: 'SANTE.COURANTS.GENERALISTE', family: 'SANTE', category: 'Soins courants', label: 'Consultations généralistes', crossTags: [], description: 'Médecins généralistes' },
  { id: 'SANTE.COURANTS.SPECIALISTE', family: 'SANTE', category: 'Soins courants', label: 'Consultations spécialistes', crossTags: [], description: 'Médecins spécialistes' },
  { id: 'SANTE.COURANTS.PHARMACIE', family: 'SANTE', category: 'Soins courants', label: 'Pharmacie', crossTags: [], description: 'Médicaments prescrits' },
  { id: 'SANTE.COURANTS.ANALYSES', family: 'SANTE', category: 'Soins courants', label: 'Analyses / Imagerie', crossTags: [], description: 'Analyses médicales' },
  { id: 'SANTE.HOSPITALISATION.SEJOUR', family: 'SANTE', category: 'Hospitalisation', label: 'Frais de séjour', crossTags: [], description: 'Frais d\'hospitalisation' },
  { id: 'SANTE.HOSPITALISATION.CHAMBRE', family: 'SANTE', category: 'Hospitalisation', label: 'Chambre particulière', crossTags: [], description: 'Chambre individuelle' },
  { id: 'SANTE.HOSPITALISATION.DEPASSEMENTS', family: 'SANTE', category: 'Hospitalisation', label: 'Dépassements d\'honoraires', crossTags: [], description: 'Honoraires chirurgicaux' },
  { id: 'SANTE.OPTIQUE.VERRES_MONTURES', family: 'SANTE', category: 'Optique', label: 'Verres / Montures / Lentilles', crossTags: [], description: 'Équipement optique' },
  { id: 'SANTE.DENTAIRE.SOINS', family: 'SANTE', category: 'Dentaire', label: 'Soins / Prothèses / Orthodontie / Implants', crossTags: [], description: 'Soins dentaires' },
  { id: 'SANTE.AUDIO.APPAREILS', family: 'SANTE', category: 'Audio', label: 'Appareils auditifs', crossTags: [], description: 'Prothèses auditives' },
  { id: 'SANTE.MEDECINES_DOUCES.FORFAIT', family: 'SANTE', category: 'Médecines douces', label: 'Ostéopathie, Acupuncture, Naturopathie', crossTags: [], description: 'Médecines alternatives' },
  { id: 'SANTE.PREVENTION.BILANS', family: 'SANTE', category: 'Prévention', label: 'Bilans de santé / Vaccins', crossTags: [], description: 'Actes de prévention' },
  { id: 'SANTE.ACCIDENT.INDIVIDUELLE', family: 'SANTE', category: 'Accident', label: 'Individuelle accident', crossTags: ['ACCIDENT_CORPOREL'], description: 'Accident corporel' }
];

const CB_ENTRIES: TaxonomyEntry[] = [
  { id: 'CB.VOYAGE.ANNULATION', family: 'CB', category: 'Voyage', label: 'Assurance annulation voyage', crossTags: ['VOYAGE'], description: 'Annulation de voyage' },
  { id: 'CB.VOYAGE.RETARD', family: 'CB', category: 'Voyage', label: 'Retard de vol / bagages', crossTags: ['VOYAGE'], description: 'Frais liés au retard' },
  { id: 'CB.VOYAGE.RAPATRIEMENT', family: 'CB', category: 'Voyage', label: 'Assurance rapatriement', crossTags: ['VOYAGE', 'ASSISTANCE'], description: 'Rapatriement' },
  { id: 'CB.VOYAGE.FRAIS_MEDICAUX', family: 'CB', category: 'Voyage', label: 'Frais médicaux à l\'étranger', crossTags: ['VOYAGE'], description: 'Soins à l\'étranger' },
  { id: 'CB.RESPONSABILITE.RC_ETRANGER', family: 'CB', category: 'Responsabilité', label: 'RC à l\'étranger', crossTags: ['RESPONSABILITE_CIVILE', 'VOYAGE'], description: 'Responsabilité civile' },
  { id: 'CB.VOL.ACHATS', family: 'CB', category: 'Vol', label: 'Vol d\'achats (30 jours)', crossTags: ['VOL'], description: 'Protection des achats' },
  { id: 'CB.VOL.BAGAGES', family: 'CB', category: 'Vol', label: 'Perte / vol de bagages', crossTags: ['VOL', 'VOYAGE'], description: 'Couverture bagages' },
  { id: 'CB.JURIDIQUE.ACHAT', family: 'CB', category: 'Protection Juridique', label: 'Litige achat / e-commerce', crossTags: ['PROTECTION_JURIDIQUE'], description: 'Litiges achats' },
  { id: 'CB.ASSISTANCE.MEDICALE', family: 'CB', category: 'Assistance', label: 'Assistance médicale voyage', crossTags: ['ASSISTANCE', 'VOYAGE'], description: 'Assistance médicale' },
  { id: 'CB.ASSISTANCE.AVANCE_FONDS', family: 'CB', category: 'Assistance', label: 'Avance de fonds', crossTags: ['ASSISTANCE'], description: 'Avance en cas de perte de moyens de paiement' },
  { id: 'CB.VEHICULE.LOCATION', family: 'CB', category: 'Véhicule', label: 'Location de voiture (CDW)', crossTags: [], description: 'Assurance véhicules de location' },
  { id: 'CB.SPORT.SKI', family: 'CB', category: 'Sport', label: 'Assurance ski / sports d\'hiver', crossTags: ['ACCIDENT_CORPOREL'], description: 'Accidents de ski' }
];

const GAV_ENTRIES: TaxonomyEntry[] = [
  { id: 'GAV.ACCIDENT.DOMESTIQUE', family: 'GAV', category: 'Accident', label: 'Accident domestique', crossTags: ['ACCIDENT_CORPOREL'], description: 'Accidents de la vie privée' },
  { id: 'GAV.ACCIDENT.MEDICAL', family: 'GAV', category: 'Accident', label: 'Accident médical', crossTags: ['ACCIDENT_CORPOREL'], description: 'Erreurs médicales' },
  { id: 'GAV.ACCIDENT.AGRESSION', family: 'GAV', category: 'Accident', label: 'Agression', crossTags: ['ACCIDENT_CORPOREL'], description: 'Agressions, attentats' },
  { id: 'GAV.ACCIDENT.CATASTROPHE', family: 'GAV', category: 'Accident', label: 'Catastrophe naturelle / technologique', crossTags: ['CATASTROPHE_NAT', 'ACCIDENT_CORPOREL'], description: 'Événements majeurs' }
];

export const TAXONOMY_BY_FAMILY: Record<ContractType, TaxonomyEntry[]> = {
  MRH: MRH_ENTRIES,
  AUTO: AUTO_ENTRIES,
  SANTE: SANTE_ENTRIES,
  CB: CB_ENTRIES,
  GAV: GAV_ENTRIES
};

const ALL_ENTRIES = [
  ...MRH_ENTRIES,
  ...AUTO_ENTRIES,
  ...SANTE_ENTRIES,
  ...CB_ENTRIES,
  ...GAV_ENTRIES
];

export const TAXONOMY: Record<string, TaxonomyEntry> = ALL_ENTRIES.reduce((acc, entry) => {
  acc[entry.id] = entry;
  return acc;
}, {} as Record<string, TaxonomyEntry>);
