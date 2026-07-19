import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/contracts/[id] — Détail d'un contrat
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findFirst({
      where: { id, userId: auth.userId },
      include: {
        guarantees: {
          include: { crossTags: true },
          orderBy: { taxonomyId: 'asc' },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Erreur détail contrat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/contracts/[id] — Modifier un contrat
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que le contrat appartient à l'utilisateur
    const existing = await prisma.contract.findFirst({
      where: { id, userId: auth.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 });
    }

    const body = await request.json();
    const { insurerName, contractNumber, monthlyPremium, startDate, endDate } = body;

    const contract = await prisma.contract.update({
      where: { id },
      data: {
        ...(insurerName !== undefined && { insurerName }),
        ...(contractNumber !== undefined && { contractNumber }),
        ...(monthlyPremium !== undefined && {
          monthlyPremium: monthlyPremium ? parseFloat(monthlyPremium) : null,
        }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
      },
      include: {
        guarantees: {
          include: { crossTags: true },
        },
      },
    });

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Erreur mise à jour contrat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contracts/[id] — Supprimer un contrat
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que le contrat appartient à l'utilisateur
    const existing = await prisma.contract.findFirst({
      where: { id, userId: auth.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 });
    }

    await prisma.contract.delete({ where: { id } });

    return NextResponse.json({ message: 'Contrat supprimé' });
  } catch (error) {
    console.error('Erreur suppression contrat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
