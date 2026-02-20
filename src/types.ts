export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}
