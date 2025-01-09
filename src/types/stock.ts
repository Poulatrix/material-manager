import { StockItem } from "@/components/AddStockForm";

export interface MaterialWithdrawal {
  id: string;
  lotNumber: number;
  quantity: number;
  reference: string;
  date: Date;
  material: string;
  dimensions: string;
  supplier: string;
}

export type { StockItem };