import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MaterialWithdrawal } from '@/types/stock';

export default function Withdrawals() {
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const q = query(collection(db, 'withdrawals'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
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
        <Link to="/">
          <Button variant="outline">Retour au stock</Button>
        </Link>
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
                <TableCell>{withdrawal.lotNumber}</TableCell>
                <TableCell>{withdrawal.reference}</TableCell>
                <TableCell>{withdrawal.quantity} mm</TableCell>
                <TableCell>{withdrawal.material}</TableCell>
                <TableCell>{withdrawal.dimensions}</TableCell>
                <TableCell>{withdrawal.supplier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}