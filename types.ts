
export type ActiveTab = 'dashboard' | 'black-money' | 'temas' | 'clonagem' | 'planos' | 'forum' | 'networking' | 'ofertas-clonadas' | 'profile' | 'kl-remotas' | 'admin' | 'downloads' | 'affiliates';

export interface StatData {
  title: string;
  value: string;
  change?: string;
  subtext?: string;
  icon: string;
  color: string;
  isPositive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  cpa: string;
  views: string;
  isHot?: boolean;
  sales?: string;
  performance?: number;
  price?: string;
  badge?: 'HOT' | 'CLONADA';
}

export interface ChartData {
  day: string;
  revenue: number;
}
