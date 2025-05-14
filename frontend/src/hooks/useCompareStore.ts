export type MajorInfo = {
  university: string;
  major: string;
  city: string;
  fee: string;
  examBlocks: string[];
  scores: { year: number; score: number }[];
};

class MajorCompareStore {
  private static instance: MajorCompareStore;
  private data: Record<string, MajorInfo> = {};

  private constructor() {}

  public static getInstance(): MajorCompareStore {
    if (!MajorCompareStore.instance) {
      MajorCompareStore.instance = new MajorCompareStore();
    }
    return MajorCompareStore.instance;
  }

  public getAll(): Record<string, MajorInfo> {
    return this.data;
  }

  public set(id: string, info: MajorInfo): void {
    this.data[id] = info;
  }

  public clear(): void {
    this.data = {};
  }
  
  public remove(id: string): void {
    delete this.data[id];
  }
}

export const majorCompareStore = MajorCompareStore.getInstance();