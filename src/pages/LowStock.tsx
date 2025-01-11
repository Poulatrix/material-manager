import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StockItem } from '@/types/stock';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useToast } from "@/components/ui/use-toast";

export default function LowStock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadLowStockItems = async () => {
      try {
        console.log('Loading low stock items...');
        // Simplifions la requête pour éviter les problèmes d'index
        const q = query(
          collection(db, 'stock'),
          where('archived', '==', false)
        );
        const querySnapshot = await getDocs(q);
        const stockItems: StockItem[] = [];
        
        querySnapshot.forEach((doc) => {
          const item = { ...doc.data(), id: doc.id } as StockItem;
          // Filtrons côté client pour les items avec remainingLength <= 200
          if (item.remainingLength <= 200) {
            stockItems.push(item);
          }
        });

        // Trions côté client
        stockItems.sort((a, b) => a.lotNumber - b.lotNumber);
        setItems(stockItems);
        console.log('Loaded low stock items:', stockItems);
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Stock Faible (&lt;= 200mm)</h1>
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
            {items.map((item) => (
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