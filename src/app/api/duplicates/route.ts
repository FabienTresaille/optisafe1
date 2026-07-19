import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { detectDuplicates } from '@/lib/services/duplicate.service';
import type { ContractType, CrossTag } from '@/lib/taxonomy/types';

/**
 * GET /api/duplicates — Récupérer les doublons détectés pour l'utilisateur
 */
export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const duplicates = await prisma.duplicatePair.findMany({
      where: { userId: auth.userId },
      include: {
        guaranteeA: {
          include: {
            contract: { select: { id: true, insurerName: true, contractType: true } },
            crossTags: true,
          },
        },
        guaranteeB: {
          include: {
            contract: { select: { id: true, insurerName: true, contractType: true } },
            crossTags: true,
          },
        },
      },
      orderBy: { overlapScore: 'desc' },
    });

    return NextResponse.json({ duplicates });
  } catch (error) {
    console.error('Erreur récupération doublons:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/duplicates/scan — Lancer un scan de doublons sur tous les contrats
 */
export async function POST() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer tous les contrats avec garanties
    const contracts = await prisma.contract.findMany({
      where: { userId: auth.userId },
      include: {
        guarantees: {
          include: { crossTags: true },
        },
      },
    });

    if (contracts.length < 2) {
      return NextResponse.json({
        duplicates: [],
        message: 'Il faut au moins 2 contrats pour détecter des doublons',
      });
    }

    // Préparer les données pour l'algorithme
    const allGuarantees = contracts.flatMap((c) =>
      c.guarantees.map((g) => ({
        guaranteeId: g.id,
        contractId: c.id,
        contractType: c.contractType as ContractType,
        contractName: c.insurerName,
        guarantee: {
          taxonomyId: g.taxonomyId,
          label: g.originalLabel,
          crossTags: g.crossTags.map((t) => t.crossTag) as CrossTag[],
          covered: g.covered,
          ceiling: g.ceiling ? Number(g.ceiling) : null,
          ceilingUnit: g.ceilingUnit as 'per_event' | 'per_year' | null,
          deductible: g.deductible ? Number(g.deductible) : null,
          deductibleType: g.deductibleType as 'fixed' | 'percentage' | null,
          waitingPeriod: g.waitingPeriodDays,
          conditions: g.conditions,
          sourceClause: g.sourceClause,
        },
      }))
    );

    // Détecter les doublons
    const results = detectDuplicates(allGuarantees);

    // Supprimer les anciens doublons et insérer les nouveaux
    await prisma.duplicatePair.deleteMany({
      where: { userId: auth.userId },
    });

    if (results.length > 0) {
      // Mapper les résultats en DuplicatePair
      // On a besoin de retrouver les IDs des garanties à partir des données
      const guaranteeMap = new Map<string, string>();
      for (const c of contracts) {
        for (const g of c.guarantees) {
          // Clé composite: contractId + taxonomyId
          guaranteeMap.set(`${c.id}:${g.taxonomyId}`, g.id);
        }
      }

      for (const result of results) {
        const guaranteeAId = guaranteeMap.get(
          `${result.guaranteeA.contractId}:${result.guaranteeA.guarantee.taxonomyId}`
        );
        const guaranteeBId = guaranteeMap.get(
          `${result.guaranteeB.contractId}:${result.guaranteeB.guarantee.taxonomyId}`
        );

        if (guaranteeAId && guaranteeBId) {
          await prisma.duplicatePair.upsert({
            where: {
              guaranteeAId_guaranteeBId_sharedCrossTag: {
                guaranteeAId,
                guaranteeBId,
                sharedCrossTag: result.sharedTag,
              },
            },
            update: {
              overlapScore: result.overlapScore,
            },
            create: {
              userId: auth.userId,
              guaranteeAId,
              guaranteeBId,
              sharedCrossTag: result.sharedTag,
              overlapScore: result.overlapScore,
            },
          });
        }
      }
    }

    // Retourner les doublons frais
    const duplicates = await prisma.duplicatePair.findMany({
      where: { userId: auth.userId },
      include: {
        guaranteeA: {
          include: {
            contract: { select: { id: true, insurerName: true, contractType: true } },
            crossTags: true,
          },
        },
        guaranteeB: {
          include: {
            contract: { select: { id: true, insurerName: true, contractType: true } },
            crossTags: true,
          },
        },
      },
      orderBy: { overlapScore: 'desc' },
    });

    return NextResponse.json({
      duplicates,
      count: duplicates.length,
      message: `${duplicates.length} doublon(s) détecté(s)`,
    });
  } catch (error) {
    console.error('Erreur scan doublons:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
