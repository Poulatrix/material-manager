import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StockItem } from '@/types/stock';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function LowStock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadLowStockItems = async () => {
      try {
        console.log('Loading low stock items...');
        const q = query(
          collection(db, 'stock'),
          where('archived', '==', false)
        );
        const querySnapshot = await getDocs(q);
        const stockItems: StockItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const item = { ...doc.data(), id: doc.id } as StockItem;
          if (item.remainingLength <= 200) {
            stockItems.push(item);
          }
        });

        stockItems.sort((a, b) => a.lotNumber - b.lotNumber);
        console.log('Found low stock items:', stockItems);
        setItems(stockItems);
      } catch (error) {
        console.error('Error loading low stock items:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du stock faible",
          variant: "destructive"
        });
      }
    };

    loadLowStockItems();
  }, [toast]);

  return (
    <div className="container mx-auto py-4 md:py-8 px-2 md:px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Stock Faible (&lt;= 200mm)</h1>
        <Link to="/">
          <Button variant="outline">Retour au stock</Button>
        </Link>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Lot</TableHead>
              <TableHead className={isMobile ? "hidden" : ""}>Type</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Longueur restante</TableHead>
              <TableHead className={isMobile ? "hidden" : ""}>Matière</TableHead>
              <TableHead className={isMobile ? "hidden" : ""}>Fournisseur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.lotNumber}</TableCell>
                <TableCell className={isMobile ? "hidden" : ""}>
                  {item.type === 'rectangular' ? 'Rectangulaire' : 'Circulaire'}
                </TableCell>
                <TableCell>
                  {item.type === 'rectangular' 
                    ? `${item.width}x${item.height} mm`
                    : `Ø${item.diameter} mm`
                  }
                </TableCell>
                <TableCell>{item.remainingLength} mm</TableCell>
                <TableCell className={isMobile ? "hidden" : ""}>{item.material}</TableCell>
                <TableCell className={isMobile ? "hidden" : ""}>{item.supplier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}