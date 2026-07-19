import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.CONTRACTS_UPLOAD_DIR || '/data/contracts';
const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || '20') || 20) * 1024 * 1024;

/**
 * POST /api/contracts/upload — Upload d'un contrat PDF
 * Stocke le fichier et crée un contrat en attente d'extraction IA
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const contractType = formData.get('contractType') as string | null;
    const insurerName = formData.get('insurerName') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!contractType || !insurerName) {
      return NextResponse.json(
        { error: 'Type de contrat et nom de l\'assureur requis' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Formats acceptés : PDF, JPEG, PNG' },
        { status: 400 }
      );
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Taille maximale : ${MAX_FILE_SIZE / 1024 / 1024}Mo` },
        { status: 400 }
      );
    }

    // Créer le répertoire utilisateur
    const userDir = join(UPLOAD_DIR, auth.userId);
    await mkdir(userDir, { recursive: true });

    // Sauvegarder le fichier
    const fileId = uuidv4();
    const extension = file.name.split('.').pop() || 'pdf';
    const fileName = `${fileId}.${extension}`;
    const filePath = join(userDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Créer le contrat en DB (en attente d'extraction)
    const contract = await prisma.contract.create({
      data: {
        userId: auth.userId,
        insurerName,
        contractType: contractType as 'MRH' | 'AUTO' | 'SANTE' | 'CB' | 'GAV',
        source: 'upload',
        filePath,
        rawExtractedData: { status: 'pending_extraction' },
      },
    });

    // TODO: Enqueue BullMQ job for AI extraction
    // await extractionQueue.add('extract-contract', { contractId: contract.id, filePath });

    return NextResponse.json(
      {
        contract: {
          id: contract.id,
          insurerName: contract.insurerName,
          contractType: contract.contractType,
          source: contract.source,
          status: 'pending_extraction',
        },
        message: 'Contrat uploadé. L\'extraction IA est en cours…',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur upload contrat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
