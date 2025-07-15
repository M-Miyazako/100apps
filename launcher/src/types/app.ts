export interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
  thumbnail?: string;
  tags: string[];
  createdAt: Date;
  isTestedWorking: boolean | null;
}

export interface AppCategory {
  id: string;
  name: string;
  color: string;
}

export interface LauncherState {
  apps: App[];
  categories: AppCategory[];
  searchQuery: string;
  selectedCategory: string | null;
  isLoading: boolean;
}