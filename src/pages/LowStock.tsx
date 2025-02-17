
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { StockItem } from '@/types/stock';
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function LowStock() {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['lowStockItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('archived', false)
        .lte('remaining_length', 200)
        .order('lot_number', { ascending: true });
      
      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du stock faible",
          variant: "destructive"
        });
        throw error;
      }

      return data as StockItem[];
    }
  });

  if (isLoading) {
    return <div className="container mx-auto py-8 px-4">Chargement...</div>;
  }

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
                <TableCell>{item.lot_number}</TableCell>
                <TableCell className={isMobile ? "hidden" : ""}>
                  {item.type === 'rectangular' ? 'Rectangulaire' : 'Circulaire'}
                </TableCell>
                <TableCell>
                  {item.type === 'rectangular' 
                    ? `${item.width}x${item.height} mm`
                    : `Ø${item.diameter} mm`
                  }
                </TableCell>
                <TableCell>{item.remaining_length} mm</TableCell>
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
