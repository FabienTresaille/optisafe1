import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/emergency — Récupérer les fiches d'urgence de l'utilisateur
 */
export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const cards = await prisma.emergencyCard.findMany({
      where: { userId: auth.userId },
      include: {
        cases: {
          orderBy: { caseType: 'asc' },
        },
      },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Erreur fiches urgence:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/emergency/generate — Générer une fiche d'urgence
 * Body: { contractType: 'MRH' | 'AUTO' | ... }
 */
export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { contractType } = body;

    if (!contractType) {
      return NextResponse.json(
        { error: 'Type de contrat requis' },
        { status: 400 }
      );
    }

    // Récupérer les contrats de ce type avec les garanties
    const contracts = await prisma.contract.findMany({
      where: {
        userId: auth.userId,
        contractType,
      },
      include: {
        guarantees: {
          include: { crossTags: true },
        },
      },
    });

    if (contracts.length === 0) {
      return NextResponse.json(
        { error: 'Aucun contrat de ce type trouvé' },
        { status: 404 }
      );
    }

    // Définir les cas d'urgence prédéfinis selon le type
    const emergencyCases = getDefaultEmergencyCases(contractType, contracts);

    // Supprimer l'ancienne fiche si elle existe
    await prisma.emergencyCard.deleteMany({
      where: {
        userId: auth.userId,
        contractType,
      },
    });

    // Créer la nouvelle fiche
    const card = await prisma.emergencyCard.create({
      data: {
        userId: auth.userId,
        contractType,
        cases: {
          create: emergencyCases,
        },
      },
      include: { cases: true },
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    console.error('Erreur génération fiche urgence:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

interface ContractWithGuarantees {
  insurerName: string;
  contractNumber: string | null;
  guarantees: {
    taxonomyId: string;
    originalLabel: string;
    covered: boolean;
    ceiling: unknown;
    deductible: unknown;
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDefaultEmergencyCases(contractType: string, contracts: ContractWithGuarantees[]): any[] {
  const mainContract = contracts[0];
  const insurerName = mainContract.insurerName;
  const contractNumber = mainContract.contractNumber || 'N° à vérifier';

  const caseTemplates: Record<string, Array<{
    caseType: string;
    whatToDo: string;
    whoToCall: string;
    coverageSummary: string;
  }>> = {
    MRH: [
      {
        caseType: 'degat_eaux',
        whatToDo: '1. Couper l\'arrivée d\'eau\n2. Protéger vos biens\n3. Prévenir vos voisins si nécessaire\n4. Déclarer le sinistre dans les 5 jours',
        whoToCall: `${insurerName} — Contrat ${contractNumber}\nNuméro d'urgence : voir votre contrat`,
        coverageSummary: findGuaranteeSummary(mainContract, 'MRH.DOMMAGES.DEGAT_EAUX'),
      },
      {
        caseType: 'incendie',
        whatToDo: '1. Appeler les pompiers (18 ou 112)\n2. Évacuer le logement\n3. Ne pas retourner dans le logement\n4. Déclarer le sinistre dans les 5 jours',
        whoToCall: `Pompiers : 18 / 112\n${insurerName} — Contrat ${contractNumber}`,
        coverageSummary: findGuaranteeSummary(mainContract, 'MRH.DOMMAGES.INCENDIE'),
      },
      {
        caseType: 'vol',
        whatToDo: '1. Déposer plainte au commissariat\n2. Lister les objets volés\n3. Déclarer le sinistre dans les 2 jours ouvrés\n4. Envoyer le récépissé de plainte à l\'assureur',
        whoToCall: `Police : 17\n${insurerName} — Contrat ${contractNumber}`,
        coverageSummary: findGuaranteeSummary(mainContract, 'MRH.DOMMAGES.VOL'),
      },
      {
        caseType: 'bris_glace',
        whatToDo: '1. Sécuriser l\'ouverture\n2. Prendre des photos\n3. Déclarer le sinistre dans les 5 jours',
        whoToCall: `${insurerName} — Contrat ${contractNumber}`,
        coverageSummary: findGuaranteeSummary(mainContract, 'MRH.DOMMAGES.BRIS_GLACE'),
      },
    ],
    AUTO: [
      {
        caseType: 'accident_auto',
        whatToDo: '1. Sécuriser les lieux (gilet, triangle)\n2. Appeler le 15 (SAMU) si blessés\n3. Remplir le constat amiable\n4. Prendre des photos\n5. Déclarer dans les 5 jours ouvrés',
        whoToCall: `SAMU : 15 / Pompiers : 18\n${insurerName} — Contrat ${contractNumber}`,
        coverageSummary: findGuaranteeSummary(mainContract, 'AUTO.TIERS.RC'),
      },
      {
        caseType: 'panne',
        whatToDo: '1. Se garer en sécurité\n2. Allumer les feux de détresse\n3. Sortir du véhicule côté glissière\n4. Appeler l\'assistance',
        whoToCall: `${insurerName} Assistance — Contrat ${contractNumber}\nDépannage autoroute : 3975`,
        coverageSummary: findGuaranteeSummary(mainContract, 'AUTO.ASSISTANCE.DEPANNAGE'),
      },
      {
        caseType: 'vol_vehicule',
        whatToDo: '1. Déposer plainte immédiatement\n2. Déclarer le sinistre dans les 2 jours ouvrés\n3. Envoyer le double des clés et les papiers du véhicule',
        whoToCall: `Police : 17\n${insurerName} — Contrat ${contractNumber}`,
        coverageSummary: findGuaranteeSummary(mainContract, 'AUTO.DOMMAGES.VOL'),
      },
    ],
    SANTE: [
      {
        caseType: 'hospitalisation',
        whatToDo: '1. Présenter votre carte mutuelle à l\'admission\n2. Demander une prise en charge directe\n3. Conserver tous les justificatifs',
        whoToCall: `${insurerName} — Contrat ${contractNumber}`,
        coverageSummary: findGuaranteeSummary(mainContract, 'SANTE.HOSPITALISATION.SEJOUR'),
      },
    ],
    CB: [
      {
        caseType: 'annulation_voyage',
        whatToDo: '1. Prévenir l\'assurance dans les 5 jours\n2. Fournir les justificatifs d\'annulation\n3. Vérifier que le voyage a été payé avec la carte',
        whoToCall: `${insurerName} — Carte se terminant par XXXX`,
        coverageSummary: findGuaranteeSummary(mainContract, 'CB.VOYAGE.ANNULATION'),
      },
      {
        caseType: 'vol_achats',
        whatToDo: '1. Déposer plainte dans les 48h\n2. Rassembler les preuves d\'achat\n3. Déclarer dans les 2 jours',
        whoToCall: `${insurerName} — Service assurance CB`,
        coverageSummary: findGuaranteeSummary(mainContract, 'CB.VOL.ACHATS'),
      },
    ],
    GAV: [
      {
        caseType: 'accident_domestique',
        whatToDo: '1. Consulter un médecin / aller aux urgences\n2. Conserver le certificat médical initial\n3. Déclarer l\'accident dans les 5 jours',
        whoToCall: `SAMU : 15\n${insurerName} — Contrat ${contractNumber}`,
        coverageSummary: findGuaranteeSummary(mainContract, 'GAV.ACCIDENT.DOMESTIQUE'),
      },
    ],
  };

  return caseTemplates[contractType] || [];
}

function findGuaranteeSummary(contract: ContractWithGuarantees, taxonomyId: string): string {
  const guarantee = contract.guarantees.find((g) => g.taxonomyId === taxonomyId);
  if (!guarantee) return 'Garantie non trouvée dans votre contrat.';
  if (!guarantee.covered) return 'Cette garantie est EXCLUE de votre contrat.';

  const parts: string[] = [`✅ Couvert par ${contract.insurerName}`];
  if (guarantee.ceiling) parts.push(`Plafond : ${guarantee.ceiling}€`);
  if (guarantee.deductible) parts.push(`Franchise : ${guarantee.deductible}€`);
  return parts.join('\n');
}
