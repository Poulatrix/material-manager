import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { StockItem, MaterialWithdrawal } from '@/types/stock';
import { supabase } from '@/integrations/supabase/client';

export default function Archives() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: archivedLots, isLoading: isLoadingLots } = useQuery({
    queryKey: ['archivedLots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('archived', true)
        .order('lot_number', { ascending: true });
      
      if (error) throw error;
      return data as StockItem[];
    }
  });

  const { data: withdrawals, isLoading: isLoadingWithdrawals } = useQuery({
    queryKey: ['allWithdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*');
      
      if (error) throw error;
      return data.map(w => ({
        ...w,
        date: new Date(w.date)
      })) as MaterialWithdrawal[];
    }
  });

  const filteredLots = archivedLots?.filter(lot => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      lot.lot_number.toString().includes(searchLower) ||
      lot.material.toLowerCase().includes(searchLower) ||
      lot.supplier.toLowerCase().includes(searchLower) ||
      (lot.type === 'rectangular' && 
        `${lot.width}x${lot.height}`.includes(searchLower)) ||
      (lot.type === 'circular' && 
        lot.diameter?.toString().includes(searchLower))
    );
  });

  if (isLoadingLots || isLoadingWithdrawals) {
    return <div className="container mx-auto py-8 px-4">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Archives</h1>
        <Link to="/">
          <Button variant="outline">Retour au stock</Button>
        </Link>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Rechercher par n° lot, dimensions, matière, fournisseur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xl"
        />
      </div>

      <div className="space-y-8">
        {filteredLots?.map(lot => (
          <div key={lot.id} className="border rounded-lg p-6 bg-white shadow">
            <h2 className="text-xl font-semibold mb-4">
              Lot n°{lot.lot_number} - {lot.material}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Dimensions</p>
                <p>
                  {lot.type === 'rectangular'
                    ? `${lot.width}x${lot.height} mm`
                    : `Ø${lot.diameter} mm`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Longueur initiale</p>
                <p>{lot.length} mm</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Longueur restante</p>
                <p>{lot.remaining_length} mm</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fournisseur</p>
                <p>{lot.supplier}</p>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Historique des retraits</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Pièce</TableHead>
                    <TableHead>Valeur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals
                    ?.filter(w => w.lot_number === lot.lot_number)
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map(withdrawal => (
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
                        <TableCell>{withdrawal.reference}</TableCell>
                        <TableCell>{withdrawal.quantity} mm</TableCell>
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
        ))}
      </div>
    </div>
  );
}
