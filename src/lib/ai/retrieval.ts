import type { AiKnowledge } from "@/src/types/database";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function computeTfIdfScore(query: string, document: string, allDocs: string[]): number {
  const queryTokens = tokenize(query);
  const docTokens = tokenize(document);
  if (queryTokens.length === 0 || docTokens.length === 0) return 0;

  const docFreq = (term: string) =>
    allDocs.filter((d) => tokenize(d).includes(term)).length;

  let score = 0;
  for (const term of queryTokens) {
    const tf = docTokens.filter((t) => t === term).length / docTokens.length;
    const df = docFreq(term);
    const idf = Math.log((allDocs.length + 1) / (df + 1)) + 1;
    score += tf * idf;
  }
  return score;
}

export interface RetrievalResult {
  title: string;
  content: string;
  category: string | null;
  score: number;
}

export function rankKnowledge(query: string, entries: AiKnowledge[]): RetrievalResult[] {
  const allTexts = entries.map((e) => `${e.title} ${e.content} ${(e.keywords ?? []).join(" ")}`);

  return entries
    .map((entry, i) => ({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      score: computeTfIdfScore(query, allTexts[i], allTexts),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export function composeAnswer(query: string, results: RetrievalResult[]): string {
  if (results.length === 0) {
    return "I don't have much information on that yet. Please contact Williams Enterprises support through our Contact page.";
  }

  const top = results[0];
  if (top.score < 0.01) {
    return "I don't have much information on that yet. Please contact Williams Enterprises support through our Contact page.";
  }

  const parts = results.slice(0, 3).map((r) => r.content);
  const unique = [...new Set(parts)];

  return `Based on what I know about Williams Enterprises:\n\n${unique.join("\n\n")}\n\nIs there anything else you'd like to know about our services or projects?`;
}

export const SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "How can I contact Williams Enterprises?",
  "Where are you located?",
  "What is your company about?",
  "Do you handle roofing projects?",
];
