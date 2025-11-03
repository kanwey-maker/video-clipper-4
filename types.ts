
export enum AppState {
  UPLOAD,
  PROCESSING,
  RESULTS,
}

export interface Clip {
  title: string;
  description: string;
  viralityScore: number;
  startPhrase: string;
  endPhrase: string;
  startTime: number;
  endTime: number;
}
