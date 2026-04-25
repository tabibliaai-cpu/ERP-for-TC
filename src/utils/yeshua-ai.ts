import { yeshuaKnowledge, type KnowledgeEntry } from '../data/yeshua-knowledge';

const THRESHOLD = 1.5;
const EXCERPT_LENGTH = 500;

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up', 'it',
  'its', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself',
  'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself',
  'he', 'him', 'his', 'she', 'her', 'hers', 'they', 'them', 'their',
  'what', 'which', 'who', 'whom', 'tell', 'explain', 'please', 'know',
  'want', 'think', 'believe', 'say', 'said', 'also', 'like', 'much',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function buildIdfMap(entries: KnowledgeEntry[]): Map<string, number> {
  const docCount = entries.length;
  const df = new Map<string, number>();

  for (const entry of entries) {
    const text = (entry.title + ' ' + entry.keywords.join(' ') + ' ' + entry.content).toLowerCase();
    const tokens = new Set(tokenize(text));
    for (const token of tokens) {
      df.set(token, (df.get(token) || 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, freq] of df) {
    idf.set(term, Math.log((docCount + 1) / (freq + 1)) + 1);
  }
  return idf;
}

const idfMap = buildIdfMap(yeshuaKnowledge);

function computeScore(query: string, entry: KnowledgeEntry): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const entryText = (entry.title + ' ' + entry.keywords.join(' ') + ' ' + entry.content).toLowerCase();
  const entryTokens = tokenize(entryText);
  const entryTokenFreq = new Map<string, number>();
  for (const token of entryTokens) {
    entryTokenFreq.set(token, (entryTokenFreq.get(token) || 0) + 1);
  }

  let dotProduct = 0;
  let queryMag = 0;
  let entryMag = 0;

  for (const qToken of queryTokens) {
    const qWeight = 1 + Math.log2(2); // boosted since it's a query
    const idf = idfMap.get(qToken) || 0.1;
    const tf = entryTokenFreq.get(qToken) || 0;
    const eWeight = tf > 0 ? 1 + Math.log2(tf + 1) : 0;

    // Keyword field bonus
    const keywordBonus = entry.keywords.some(kw => kw.includes(qToken)) ? 3 : 0;
    // Title bonus
    const titleBonus = entry.title.toLowerCase().includes(qToken) ? 2 : 0;

    dotProduct += qWeight * eWeight * idf * idf + keywordBonus + titleBonus;
    queryMag += (qWeight * idf) * (qWeight * idf);

    if (eWeight > 0) {
      entryMag += (eWeight * idf) * (eWeight * idf);
    }
  }

  const denominator = Math.sqrt(queryMag) * Math.sqrt(entryMag);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

export interface YeshuaResponse {
  text: string;
  source?: string;
}

export function getResponse(question: string): YeshuaResponse {
  const scored = yeshuaKnowledge.map(entry => ({
    entry,
    score: computeScore(question, entry),
  }));

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  if (best && best.score >= THRESHOLD) {
    const excerpt = best.entry.content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, EXCERPT_LENGTH);

    return {
      text: excerpt + '...',
      source: best.entry.title,
    };
  }

  const fallbacks = [
    "I appreciate your question. While I don't have a specific match in my current knowledge base, I encourage you to pray and seek guidance from the Scriptures. As James 1:5 says, \"If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.\"",
    "That's a thoughtful question. I don't have a direct answer from my theological resources, but remember that God's Word is a lamp to our feet and a light to our path (Psalm 119:105). Consider bringing this to your pastor or a trusted spiritual mentor for deeper discussion.",
    "I'm still growing in my understanding. While I can't provide a specific answer right now, I'd encourage you to search the Scriptures diligently. Acts 17:11 commends the Bereans for examining the Scriptures daily to see if what was said was true.",
    "Thank you for that question. Though I don't have a matching resource, remember that \"the fear of the LORD is the beginning of wisdom\" (Proverbs 9:10). Continue to seek the Lord in prayer and through His Word for the answers you seek.",
  ];

  return {
    text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
  };
}
