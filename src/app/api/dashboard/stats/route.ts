import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/dashboard/stats — Statistiques du dashboard
 */
export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const [
      contractCount,
      guaranteeCount,
      duplicateCount,
      emergencyCardCount,
    ] = await Promise.all([
      prisma.contract.count({ where: { userId: auth.userId } }),
      prisma.guarantee.count({
        where: { contract: { userId: auth.userId } },
      }),
      prisma.duplicatePair.count({
        where: { userId: auth.userId, status: 'new_duplicate' },
      }),
      prisma.emergencyCard.count({ where: { userId: auth.userId } }),
    ]);

    // Recent contracts
    const recentContracts = await prisma.contract.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        insurerName: true,
        contractType: true,
        source: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      stats: {
        contractCount,
        guaranteeCount,
        duplicateCount,
        emergencyCardCount,
      },
      recentContracts,
    });
  } catch (error) {
    console.error('Erreur stats dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
