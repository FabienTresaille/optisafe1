import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { compareContracts } from '@/lib/services/comparison.service';
import type { ContractType } from '@/lib/taxonomy/types';

/**
 * POST /api/compare — Comparer 2+ contrats du même type
 * Body: { contractIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { contractIds } = body;

    if (!contractIds || !Array.isArray(contractIds) || contractIds.length < 2) {
      return NextResponse.json(
        { error: 'Au moins 2 IDs de contrats sont requis' },
        { status: 400 }
      );
    }

    // Récupérer les contrats avec garanties
    const contracts = await prisma.contract.findMany({
      where: {
        id: { in: contractIds },
        userId: auth.userId,
      },
      include: {
        guarantees: {
          include: { crossTags: true },
        },
      },
    });

    if (contracts.length < 2) {
      return NextResponse.json(
        { error: 'Contrats introuvables ou non autorisés' },
        { status: 404 }
      );
    }

    // Transformer les données pour le service de comparaison
    const contractsForComparison = contracts.map((c) => ({
      id: c.id,
      name: c.insurerName,
      type: c.contractType as ContractType,
      monthlyPremium: c.monthlyPremium ? Number(c.monthlyPremium) : undefined,
      guarantees: c.guarantees.map((g) => ({
        taxonomyId: g.taxonomyId,
        label: g.originalLabel,
        crossTags: g.crossTags.map((t) => t.crossTag),
        covered: g.covered,
        ceiling: g.ceiling ? Number(g.ceiling) : null,
        ceilingUnit: g.ceilingUnit as 'per_event' | 'per_year' | null,
        deductible: g.deductible ? Number(g.deductible) : null,
        deductibleType: g.deductibleType as 'fixed' | 'percentage' | null,
        waitingPeriod: g.waitingPeriodDays,
        conditions: g.conditions,
        sourceClause: g.sourceClause,
      })),
    }));

    const comparison = compareContracts(contractsForComparison);

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error('Erreur comparaison:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
