
export interface StockItem {
  id?: string;
  lot_number: number;
  type: 'rectangular' | 'circular';
  width?: number;
  height?: number;
  diameter?: number;
  length: number;
  material: string;
  remaining_length: number;
  supplier: string;
  price?: number;
  archived?: boolean;
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
  pieceInfo?: {
    name: string;
    quantity: number;
  };
}
