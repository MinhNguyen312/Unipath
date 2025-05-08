export type MajorInfo = {
    university: string;
    major: string;
    city: string;
    fee: string;
    examBlocks: string[];
    scores: { year: number; score: number }[];
  };
  
export const majorCompareCache: Record<string, MajorInfo> = {};