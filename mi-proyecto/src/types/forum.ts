export interface Category {
  id: string;
  name: string;
  threadCount: number;
}

export interface Thread {
  id: string;
  title: string;
  excerpt?: string;
  category: string;
  imageUrl?: string;
  author: string;
  createdAt: string;
  repliesCount: number;
  reactionsCount: number;
}
