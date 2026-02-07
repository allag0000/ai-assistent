
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  image?: string;
  timestamp: Date;
}

export interface RenderingParams {
  style: string;
  lighting: string;
  materials: string;
  resolution: '1K' | '2K' | '4K';
}
