
export interface fillInBlank {
  prompt: string;
  blanks: string[];
  answers: string[];
  hints: string[];
  difficulty: "easy" | "medium" | "hard";
  choices?: string[][];
}

export interface QA {
  question: string;
  answer: string;
}
