import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/contracts — Liste tous les contrats de l'utilisateur
 */
export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const contracts = await prisma.contract.findMany({
      where: { userId: auth.userId },
      include: {
        guarantees: {
          include: { crossTags: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error('Erreur liste contrats:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contracts — Créer un contrat (saisie manuelle)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const {
      insurerName,
      contractType,
      contractNumber,
      monthlyPremium,
      startDate,
      endDate,
      guarantees,
    } = body;

    // Validation
    if (!insurerName || !contractType) {
      return NextResponse.json(
        { error: 'Nom de l\'assureur et type de contrat requis' },
        { status: 400 }
      );
    }

    const validTypes = ['MRH', 'AUTO', 'SANTE', 'CB', 'GAV'];
    if (!validTypes.includes(contractType)) {
      return NextResponse.json(
        { error: `Type de contrat invalide. Valeurs acceptées : ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Créer le contrat avec ses garanties
    const contract = await prisma.contract.create({
      data: {
        userId: auth.userId,
        insurerName,
        contractType,
        contractNumber: contractNumber || null,
        monthlyPremium: monthlyPremium ? parseFloat(monthlyPremium) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        source: 'manual',
        guarantees: guarantees
          ? {
              create: guarantees.map((g: {
                taxonomyId: string;
                originalLabel: string;
                covered?: boolean;
                ceiling?: number;
                ceilingUnit?: string;
                deductible?: number;
                deductibleType?: string;
                waitingPeriodDays?: number;
                conditions?: string;
                sourceClause?: string;
                crossTags?: string[];
              }) => ({
                taxonomyId: g.taxonomyId,
                originalLabel: g.originalLabel,
                covered: g.covered ?? true,
                ceiling: g.ceiling ? parseFloat(String(g.ceiling)) : null,
                ceilingUnit: g.ceilingUnit || null,
                deductible: g.deductible ? parseFloat(String(g.deductible)) : null,
                deductibleType: g.deductibleType || null,
                waitingPeriodDays: g.waitingPeriodDays || null,
                conditions: g.conditions || null,
                sourceClause: g.sourceClause || null,
                crossTags: g.crossTags
                  ? { create: g.crossTags.map((tag: string) => ({ crossTag: tag })) }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        guarantees: {
          include: { crossTags: true },
        },
      },
    });

    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    console.error('Erreur création contrat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
