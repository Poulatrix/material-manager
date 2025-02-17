
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MaterialWithdrawal } from '@/types/stock';
import { supabase } from '@/integrations/supabase/client';

export default function Withdrawals() {
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map(w => ({
        ...w,
        date: new Date(w.date)
      })) as MaterialWithdrawal[];
    }
  });

  if (isLoading) {
    return <div className="container mx-auto py-8 px-4">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Historique des Retraits</h1>
        <div className="space-x-4">
          <Link to="/">
            <Button variant="outline">Retour au stock</Button>
          </Link>
          <Link to="/archives">
            <Button variant="outline">Voir les archives</Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>N° Lot</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Quantité retirée</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Pièce</TableHead>
              <TableHead>Valeur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals?.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>
                  {withdrawal.date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>{withdrawal.lot_number}</TableCell>
                <TableCell>{withdrawal.reference}</TableCell>
                <TableCell>{withdrawal.quantity} mm</TableCell>
                <TableCell>{withdrawal.material}</TableCell>
                <TableCell>{withdrawal.dimensions}</TableCell>
                <TableCell>{withdrawal.supplier}</TableCell>
                <TableCell>
                  {withdrawal.piece_info
                    ? `${withdrawal.piece_info.name} (${withdrawal.piece_info.quantity} pcs)`
                    : '-'}
                </TableCell>
                <TableCell>
                  {typeof withdrawal.value === 'number' 
                    ? `${withdrawal.value.toFixed(2)} €` 
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
