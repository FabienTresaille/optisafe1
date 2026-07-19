import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { answerWithRAG, generateEmbedding } from '@/lib/services/gemini.service';

/**
 * POST /api/ask — Poser une question sur ses contrats (RAG)
 * Body: { question: string, contractIds?: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { question, contractIds } = body;

    if (!question || typeof question !== 'string' || question.trim().length < 5) {
      return NextResponse.json(
        { error: 'Veuillez poser une question d\'au moins 5 caractères' },
        { status: 400 }
      );
    }

    // Construire le filtre pour les chunks
    const contractFilter: { userId: string; id?: { in: string[] } } = {
      userId: auth.userId,
    };
    if (contractIds && Array.isArray(contractIds) && contractIds.length > 0) {
      contractFilter.id = { in: contractIds };
    }

    // Vérifier que l'utilisateur a des contrats indexés
    const contracts = await prisma.contract.findMany({
      where: contractFilter,
      select: { id: true, insurerName: true, contractType: true },
    });

    if (contracts.length === 0) {
      return NextResponse.json(
        { error: 'Aucun contrat trouvé. Importez d\'abord un contrat.' },
        { status: 404 }
      );
    }

    const contractIdList = contracts.map((c) => c.id);
    const contractNameMap = new Map(contracts.map((c) => [c.id, `${c.insurerName} (${c.contractType})`]));

    // Générer l'embedding de la question
    const questionEmbedding = await generateEmbedding(question);

    if (questionEmbedding.length === 0) {
      return NextResponse.json(
        { error: 'Erreur lors du traitement de la question' },
        { status: 500 }
      );
    }

    // Recherche vectorielle — récupérer les chunks les plus pertinents
    // Note: pgvector cosine distance query via raw SQL
    const embeddingStr = `[${questionEmbedding.join(',')}]`;
    
    const relevantChunks = await prisma.$queryRawUnsafe<
      { id: string; content: string; contract_id: string; distance: number }[]
    >(
      `SELECT id, content, contract_id, 
              embedding <=> $1::vector AS distance
       FROM document_chunks 
       WHERE contract_id = ANY($2::uuid[])
       AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT 5`,
      embeddingStr,
      contractIdList
    );

    if (relevantChunks.length === 0) {
      return NextResponse.json({
        answer: 'Vos contrats n\'ont pas encore été indexés pour la recherche IA. Veuillez patienter que l\'extraction soit terminée.',
        sources: [],
      });
    }

    // Préparer le contexte pour le RAG
    const chunksWithNames = relevantChunks.map((chunk) => ({
      content: chunk.content,
      contractName: contractNameMap.get(chunk.contract_id) || 'Contrat inconnu',
    }));

    // Appeler Gemini avec le contexte RAG
    const result = await answerWithRAG(question, chunksWithNames);

    return NextResponse.json({
      answer: result.answer,
      sources: result.sources,
      question,
    });
  } catch (error) {
    console.error('Erreur recherche IA:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
