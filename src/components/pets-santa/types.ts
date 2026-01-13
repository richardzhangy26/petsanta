export type Page = 'home' | 'pricing' | 'my-creations' | 'billing';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'studio';
}

export interface Creation {
  id: string;
  originalImage: string;
  generatedImage: string;
  style: string;
  date: string;
}

export interface ImageGenerationTask {
  id: string;
  userId: string;
  taskId: string;
  originalImageUrl: string;
  generatedImageUrl: string | null;
  prompt: string;
  style: string;
  aspectRatio: string;
  resolution: string;
  outputFormat: string;
  status: 'waiting' | 'processing' | 'completed' | 'failed';
  creditsUsed: number;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface StyleTemplate {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}
