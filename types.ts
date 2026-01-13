export interface Question {
  id: string;
  text: string;
}

export interface Memory {
  photoUrl: string;
  question: Question;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  READY = 'READY',
  VIEWING = 'VIEWING',
  MOSAIC_SETUP = 'MOSAIC_SETUP'
}