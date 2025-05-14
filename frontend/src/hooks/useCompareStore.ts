export type MajorInfo = {
  university: string;
  major: string;
  city: string;
  fee: string;
  examBlocks: string[];
  scores: { year: number; score: number }[];
};

export const majorCompareStore: Record<string, MajorInfo> = {};