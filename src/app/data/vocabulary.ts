export interface VocabWord {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced" | "native";
  usFrequency: number; // 1-10, how common in US English
}

export const vocabularyCategories = [
  "Daily Conversation",
  "Business & Professional",
  "Real Estate",
  "Music & Entertainment",
  "Technology",
  "Social & Relationships",
  "Food & Dining",
  "Travel",
  "Emotions & Feelings",
  "Slang & Informal",
];

// Import the full 9000 word database
import { fullVocabularyDatabase } from "./vocabulary-generator";

// Full 9000 words organized by category
export const vocabularyDatabase: VocabWord[] = fullVocabularyDatabase;

export function getVocabularyByCategory(category: string): VocabWord[] {
  return vocabularyDatabase.filter(word => word.category === category);
}

export function getVocabularyByLevel(level: string): VocabWord[] {
  return vocabularyDatabase.filter(word => word.level === level);
}

export function getRandomWords(count: number): VocabWord[] {
  const shuffled = [...vocabularyDatabase].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}