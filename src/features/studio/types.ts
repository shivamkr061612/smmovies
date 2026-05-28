export interface Movie {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl: string;
  quality?: string;
  category?: string;
  slug?: string;
}

export interface Category {
  name: string;
  slug: string;
}

export interface ScrapeResult {
  movies: Movie[];
  categories?: Category[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PostContent {
  title: string;
  date: string;
  imageUrl: string;
  bodyHtml: string;
  categories: { name: string; slug: string }[];
  downloadLinks: { label: string; url: string }[];
  screenshots: string[];
}
