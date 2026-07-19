import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/duplicates/[id] — Mettre à jour le statut d'un doublon
 * Body: { status: 'seen' | 'ignored' | 'resolved' }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['seen', 'ignored', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Prisma enum mapping: 'new' is stored as 'new_duplicate'
    const statusMap: Record<string, 'new_duplicate' | 'seen' | 'ignored' | 'resolved'> = {
      new: 'new_duplicate',
      seen: 'seen',
      ignored: 'ignored',
      resolved: 'resolved',
    };

    const duplicate = await prisma.duplicatePair.findFirst({
      where: { id, userId: auth.userId },
    });

    if (!duplicate) {
      return NextResponse.json({ error: 'Doublon introuvable' }, { status: 404 });
    }

    const updated = await prisma.duplicatePair.update({
      where: { id },
      data: { status: statusMap[status] || 'seen' },
    });

    return NextResponse.json({ duplicate: updated });
  } catch (error) {
    console.error('Erreur mise à jour doublon:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
