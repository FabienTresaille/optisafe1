import { GoogleGenAI } from '@google/genai';
import { TAXONOMY_BY_FAMILY } from '@/lib/taxonomy/registry';
import type { ContractType, ExtractedGuarantee } from '@/lib/taxonomy/types';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

const MODEL_NAME = 'gemini-2.5-flash';
const EMBEDDING_MODEL = 'text-embedding-004';

/**
 * Extract structured guarantee data from raw contract text using Gemini
 */
export async function extractGuaranteesFromText(
  contractText: string,
  contractType: ContractType
): Promise<ExtractedGuarantee[]> {
  const taxonomyEntries = TAXONOMY_BY_FAMILY[contractType] || [];
  const taxonomyDescription = taxonomyEntries
    .map((entry) => `- ${entry.id}: ${entry.label} (${entry.category}) [Tags: ${entry.crossTags.join(', ') || 'aucun'}]`)
    .join('\n');

  const prompt = `Tu es un expert en assurances françaises. Analyse le texte suivant d'un contrat d'assurance de type ${contractType} et extrais les garanties structurées.

RÉFÉRENTIEL DE GARANTIES ATTENDU:
${taxonomyDescription}

TEXTE DU CONTRAT:
---
${contractText}
---

Pour chaque garantie trouvée dans le contrat, retourne un objet JSON avec les champs suivants:
- taxonomyId: l'identifiant du référentiel ci-dessus (ex: "MRH.DOMMAGES.VOL")
- label: le libellé tel qu'il apparaît dans le contrat
- crossTags: les tags transversaux associés selon le référentiel
- covered: true si la garantie est couverte, false si elle est exclue
- ceiling: le plafond en euros (nombre ou null si illimité/non spécifié)
- ceilingUnit: "per_event" ou "per_year" (ou null)
- deductible: la franchise en euros (nombre ou null)
- deductibleType: "fixed" (euros) ou "percentage" (ou null)
- waitingPeriod: le délai de carence en jours (nombre ou null)
- conditions: les conditions particulières importantes (texte court ou null)
- sourceClause: la référence de la clause/article/page dans le contrat (texte court)

RÈGLES IMPORTANTES:
1. Ne retourne QUE les garanties réellement présentes dans le texte
2. Si une information n'est pas trouvée dans le texte, utilise null
3. Sois précis sur les montants (euros, %)
4. Si une garantie est explicitement exclue, mets covered=false
5. Cite la clause/section source quand c'est possible

Retourne UNIQUEMENT un tableau JSON valide, sans commentaires ni texte avant/après.`;

  const response = await genAI.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.1, // Low temperature for factual extraction
      maxOutputTokens: 8192,
    },
  });

  const text = response.text?.trim() || '[]';
  
  // Parse JSON response, handling potential markdown code blocks
  let jsonText = text;
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const guarantees: ExtractedGuarantee[] = JSON.parse(jsonText);
    return guarantees;
  } catch (parseError) {
    console.error('Erreur de parsing de la réponse Gemini:', parseError);
    console.error('Réponse brute:', text);
    return [];
  }
}

/**
 * Generate embeddings for a text chunk using Gemini
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await genAI.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
  });

  return response.embeddings?.[0]?.values || [];
}

/**
 * Generate embeddings for multiple text chunks (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  
  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((text) => generateEmbedding(text))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Answer a user question using RAG (Retrieval Augmented Generation)
 * Uses contract text chunks as context
 */
export async function answerWithRAG(
  question: string,
  relevantChunks: { content: string; contractName: string }[]
): Promise<{ answer: string; sources: string[] }> {
  const context = relevantChunks
    .map((chunk, i) => `[Source ${i + 1} — ${chunk.contractName}]\n${chunk.content}`)
    .join('\n\n---\n\n');

  const prompt = `Tu es un assistant spécialisé en assurances françaises. L'utilisateur te pose une question sur ses contrats d'assurance. Tu dois répondre UNIQUEMENT en te basant sur les extraits de contrats fournis ci-dessous.

EXTRAITS DE CONTRATS:
${context}

QUESTION DE L'UTILISATEUR:
${question}

RÈGLES IMPÉRATIVES:
1. Réponds UNIQUEMENT avec des informations présentes dans les extraits ci-dessus
2. Cite systématiquement la source (numéro de source et nom du contrat)
3. Si l'information n'est pas présente dans les extraits, dis clairement : "Cette information n'apparaît pas dans vos contrats."
4. N'invente JAMAIS d'information. Aucune hallucination.
5. Sois clair, concis et utile
6. Réponds en français

Formatte ta réponse en JSON avec:
- "answer": ta réponse textuelle complète
- "sources": un tableau des sources utilisées (ex: ["Source 1 — AXA Habitation", "Source 2 — GMF Auto"])`;

  const response = await genAI.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });

  const text = response.text?.trim() || '';
  
  let jsonText = text;
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const result = JSON.parse(jsonText);
    return {
      answer: result.answer || 'Impossible de générer une réponse.',
      sources: result.sources || [],
    };
  } catch {
    // If JSON parsing fails, return the raw text
    return {
      answer: text || 'Impossible de générer une réponse.',
      sources: [],
    };
  }
}

/**
 * Split contract text into chunks for RAG indexing
 */
export function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Keep overlap from end of previous chunk
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n\n' + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
