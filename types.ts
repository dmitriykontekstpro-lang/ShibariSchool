export interface DictionaryEntry {
  term: string;
  definition: string;
}

export interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  content: string[]; // Array of paragraphs
}

export enum TabView {
  LESSONS = 'LESSONS',
  SETTINGS = 'SETTINGS'
}