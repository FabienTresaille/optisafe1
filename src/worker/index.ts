import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';

// Initialize connections
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const prisma = new PrismaClient();

// Queues
export const extractionQueue = new Queue('contract-extraction', { connection });
export const duplicateScanQueue = new Queue('duplicate-scan', { connection });

/**
 * Worker: Contract extraction via Gemini
 * Processes uploaded PDFs: extract text → send to Gemini → save guarantees
 */
const extractionWorker = new Worker(
  'contract-extraction',
  async (job) => {
    const { contractId, filePath } = job.data;
    console.log(`[Worker] Extraction du contrat ${contractId} depuis ${filePath}`);

    try {
      // Update status
      await prisma.contract.update({
        where: { id: contractId },
        data: { rawExtractedData: { status: 'extracting' } },
      });

      // Read the file
      const fileBuffer = await readFile(filePath);
      
      // Detect file type and extract text
      let extractedText = '';
      
      if (filePath.endsWith('.pdf')) {
        // Use pdf-parse for PDF files
        // @ts-expect-error - pdf-parse types are not fully compatible with dynamic import
        const pdfParseModule = await import('pdf-parse');
        // @ts-expect-error
        const pdfParse = pdfParseModule.default || pdfParseModule;
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
      } else {
        // For images, we'd use Tesseract.js (simplified for now)
        console.log('[Worker] Image OCR not yet implemented, skipping');
        await prisma.contract.update({
          where: { id: contractId },
          data: { rawExtractedData: { status: 'error', error: 'OCR non encore implémenté pour les images' } },
        });
        return;
      }

      if (!extractedText || extractedText.trim().length < 50) {
        await prisma.contract.update({
          where: { id: contractId },
          data: { rawExtractedData: { status: 'error', error: 'Texte insuffisant extrait du document' } },
        });
        return;
      }

      // Get contract type
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        select: { contractType: true, userId: true },
      });

      if (!contract) {
        throw new Error('Contrat introuvable');
      }

      // Dynamic import of Gemini service (ESM compatibility)
      const { extractGuaranteesFromText, splitTextIntoChunks, generateEmbedding } = 
        await import('../lib/services/gemini.service');

      // Extract guarantees via Gemini
      const guarantees = await extractGuaranteesFromText(
        extractedText,
        contract.contractType as 'MRH' | 'AUTO' | 'SANTE' | 'CB' | 'GAV'
      );

      // Save guarantees to DB
      for (const g of guarantees) {
        await prisma.guarantee.create({
          data: {
            contractId,
            taxonomyId: g.taxonomyId,
            originalLabel: g.label,
            covered: g.covered,
            ceiling: g.ceiling,
            ceilingUnit: g.ceilingUnit,
            deductible: g.deductible,
            deductibleType: g.deductibleType,
            waitingPeriodDays: g.waitingPeriod,
            conditions: g.conditions,
            sourceClause: g.sourceClause,
            crossTags: g.crossTags?.length
              ? { create: g.crossTags.map((tag) => ({ crossTag: tag })) }
              : undefined,
          },
        });
      }

      // Index text chunks for RAG
      const chunks = splitTextIntoChunks(extractedText);
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i]);
        const embeddingStr = `[${embedding.join(',')}]`;

        await prisma.$executeRawUnsafe(
          `INSERT INTO document_chunks (id, contract_id, chunk_index, content, embedding)
           VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4::vector)`,
          contractId,
          i,
          chunks[i],
          embeddingStr
        );
      }

      // Update contract status
      await prisma.contract.update({
        where: { id: contractId },
        data: {
          rawExtractedData: {
            status: 'completed',
            extractedAt: new Date().toISOString(),
            guaranteeCount: guarantees.length,
            chunkCount: chunks.length,
          },
        },
      });

      // Trigger duplicate scan for this user
      await duplicateScanQueue.add('scan', { userId: contract.userId });

      console.log(`[Worker] Extraction terminée: ${guarantees.length} garanties, ${chunks.length} chunks`);
    } catch (error) {
      console.error(`[Worker] Erreur extraction contrat ${contractId}:`, error);
      await prisma.contract.update({
        where: { id: contractId },
        data: {
          rawExtractedData: {
            status: 'error',
            error: String(error),
          },
        },
      });
      throw error; // Re-throw for BullMQ retry
    }
  },
  {
    connection,
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60000, // Max 5 jobs per minute (Gemini rate limiting)
    },
  }
);

/**
 * Worker: Duplicate scan
 * Scans all user contracts for cross-contract duplicates
 */
const duplicateScanWorker = new Worker(
  'duplicate-scan',
  async (job) => {
    const { userId } = job.data;
    console.log(`[Worker] Scan de doublons pour l'utilisateur ${userId}`);

    try {
      const contracts = await prisma.contract.findMany({
        where: { userId },
        include: {
          guarantees: {
            include: { crossTags: true },
          },
        },
      });

      if (contracts.length < 2) return;

      const { detectDuplicates } = await import('../lib/services/duplicate.service');

      const allGuarantees = contracts.flatMap((c) =>
        c.guarantees.map((g) => ({
          guaranteeId: g.id,
          contractId: c.id,
          contractType: c.contractType as 'MRH' | 'AUTO' | 'SANTE' | 'CB' | 'GAV',
          contractName: c.insurerName,
          guarantee: {
            taxonomyId: g.taxonomyId,
            label: g.originalLabel,
            crossTags: g.crossTags.map((t) => t.crossTag) as ('RESPONSABILITE_CIVILE' | 'ACCIDENT_CORPOREL' | 'VOL' | 'VOYAGE' | 'PROTECTION_JURIDIQUE' | 'ASSISTANCE' | 'BRIS' | 'CATASTROPHE_NAT')[],
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

      const results = detectDuplicates(allGuarantees);

      // Clear old duplicates and insert new ones
      await prisma.duplicatePair.deleteMany({ where: { userId } });

      for (const result of results) {
        const gA = allGuarantees.find(
          (g) => g.contractId === result.guaranteeA.contractId && g.guarantee.taxonomyId === result.guaranteeA.guarantee.taxonomyId
        );
        const gB = allGuarantees.find(
          (g) => g.contractId === result.guaranteeB.contractId && g.guarantee.taxonomyId === result.guaranteeB.guarantee.taxonomyId
        );

        if (gA && gB) {
          await prisma.duplicatePair.create({
            data: {
              userId,
              guaranteeAId: gA.guaranteeId,
              guaranteeBId: gB.guaranteeId,
              sharedCrossTag: result.sharedTag,
              overlapScore: result.overlapScore,
            },
          });
        }
      }

      console.log(`[Worker] ${results.length} doublon(s) détecté(s)`);
    } catch (error) {
      console.error(`[Worker] Erreur scan doublons:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 1,
  }
);

// Error handling
extractionWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} échoué:`, err.message);
});

duplicateScanWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job doublon ${job?.id} échoué:`, err.message);
});

console.log('[Worker] Workers démarrés — En attente de jobs...');
