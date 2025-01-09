import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StockItem } from '@/components/AddStockForm';

interface LowStockProps {
  items: StockItem[];
}

export default function LowStock({ items }: LowStockProps) {
  const lowStockItems = items.filter(item => item.remainingLength < 200);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Stock Faible (< 200mm)</h1>
        <Link to="/">
          <Button variant="outline">Retour au stock</Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Lot</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Longueur restante</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead>Fournisseur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockItems.map((item) => (
              <TableRow key={item.lotNumber}>
                <TableCell>{item.lotNumber}</TableCell>
                <TableCell>{item.type === 'rectangular' ? 'Rectangulaire' : 'Circulaire'}</TableCell>
                <TableCell>
                  {item.type === 'rectangular' 
                    ? `${item.width}x${item.height} mm`
                    : `Ø${item.diameter} mm`
                  }
                </TableCell>
                <TableCell>{item.remainingLength} mm</TableCell>
                <TableCell>{item.material}</TableCell>
                <TableCell>{item.supplier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}