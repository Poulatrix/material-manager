export interface StockItem {
  id?: string;
  lotNumber: number;
  type: 'rectangular' | 'circular';
  width?: number;
  height?: number;
  diameter?: number;
  length: number;
  material: string;
  remainingLength: number;
  supplier: string;
  price?: number;
}

export interface MaterialWithdrawal {
  id: string;
  lotNumber: number;
  quantity: number;
  reference: string;
  date: Date;
  material: string;
  dimensions: string;
  supplier: string;
  value: number;
}