import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { StockItem, MaterialWithdrawal } from '@/types/stock';

interface MaterialReference {
  dimensions: string;
  material: string;
  suppliers: string[];
  totalConsumed: number;
}

export default function MaterialReferences() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof MaterialReference>('dimensions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: withdrawals, isLoading: isLoadingWithdrawals } = useQuery({
    queryKey: ['allWithdrawals'],
    queryFn: async () => {
      console.log('Loading all withdrawals...');
      const querySnapshot = await getDocs(collection(db, 'withdrawals'));
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as MaterialWithdrawal[];
    }
  });

  const { data: stockItems, isLoading: isLoadingStock } = useQuery({
    queryKey: ['allStock'],
    queryFn: async () => {
      console.log('Loading all stock items...');
      const querySnapshot = await getDocs(collection(db, 'stock'));
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as StockItem[];
    }
  });

  const materialReferences = useMemo(() => {
    if (!stockItems || !withdrawals) return [];

    const referenceMap = new Map<string, MaterialReference>();

    // Process stock items
    stockItems.forEach(item => {
      const dimensions = item.type === 'rectangular' 
        ? `${item.width}x${item.height}`
        : `Ø${item.diameter}`;
      const key = `${dimensions}-${item.material}`;

      if (!referenceMap.has(key)) {
        referenceMap.set(key, {
          dimensions: dimensions,
          material: item.material,
          suppliers: [item.supplier],
          totalConsumed: 0
        });
      } else {
        const ref = referenceMap.get(key)!;
        if (!ref.suppliers.includes(item.supplier)) {
          ref.suppliers.push(item.supplier);
        }
      }
    });

    // Calculate total consumed
    withdrawals.forEach(withdrawal => {
      const dimensions = withdrawal.dimensions.replace(' mm', '');
      const key = `${dimensions}-${withdrawal.material}`;
      
      if (referenceMap.has(key)) {
        const ref = referenceMap.get(key)!;
        ref.totalConsumed += withdrawal.quantity;
      }
    });

    return Array.from(referenceMap.values());
  }, [stockItems, withdrawals]);

  const sortedReferences = useMemo(() => {
    if (!materialReferences) return [];

    return [...materialReferences].sort((a, b) => {
      let comparison = 0;
      
      switch (sortColumn) {
        case 'dimensions':
          comparison = a.dimensions.localeCompare(b.dimensions);
          break;
        case 'material':
          comparison = a.material.localeCompare(b.material);
          break;
        case 'totalConsumed':
          comparison = a.totalConsumed - b.totalConsumed;
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [materialReferences, sortColumn, sortDirection]);

  const filteredReferences = useMemo(() => {
    return sortedReferences.filter(ref => 
      ref.dimensions.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.suppliers.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sortedReferences, searchTerm]);

  const handleSort = (column: keyof MaterialReference) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  if (isLoadingWithdrawals || isLoadingStock) {
    return <div className="container mx-auto py-8 px-4">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Références Matière</h1>
        <div className="w-full md:w-auto">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Link to="/">
          <Button variant="outline">Retour au stock</Button>
        </Link>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('dimensions')}
              >
                Dimensions
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('material')}
              >
                Matière
              </TableHead>
              <TableHead>Fournisseurs</TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => handleSort('totalConsumed')}
              >
                Total Consommé (mm)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReferences.map((ref, index) => (
              <TableRow key={index}>
                <TableCell>{ref.dimensions}</TableCell>
                <TableCell>{ref.material}</TableCell>
                <TableCell>{ref.suppliers.join(', ')}</TableCell>
                <TableCell className="text-right">{ref.totalConsumed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}