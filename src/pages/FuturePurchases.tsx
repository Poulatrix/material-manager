
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StockItem } from '@/types/stock';
import { AddStockForm } from '@/components/AddStockForm';
import { useToast } from '@/components/ui/use-toast';

interface FuturePurchase {
  id: string;
  type: 'rectangular' | 'circular';
  width?: number;
  height?: number;
  diameter?: number;
  length: number;
  material: string;
  supplier: string;
  price?: number;
  created_at?: string;
}

export default function FuturePurchases() {
  const { toast } = useToast();

  const { data: purchases = [], refetch } = useQuery({
    queryKey: ['future-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('future_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        ...item,
        type: item.type === 'rectangular' || item.type === 'circular'
          ? item.type as 'rectangular' | 'circular'
          : 'rectangular'
      })) as FuturePurchase[];
    }
  });

  const { data: currentStock = [] } = useQuery({
    queryKey: ['stock-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('archived', false)
        .order('lot_number', { ascending: true });
      
      if (error) throw error;
      return data as StockItem[];
    }
  });

  const nextLotNumber = currentStock.length > 0 
    ? Math.max(...currentStock.map(item => item.lot_number)) + 1 
    : 1;

  const deletePurchaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('future_purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Supprimé",
        description: "L'achat prévu a été supprimé avec succès"
      });
      refetch();
    }
  });

  const transferToStockMutation = useMutation({
    mutationFn: async (purchase: FuturePurchase) => {
      // First, create the new stock item
      const newStockItem: StockItem = {
        lot_number: nextLotNumber,
        type: purchase.type,
        width: purchase.width,
        height: purchase.height,
        diameter: purchase.diameter,
        length: purchase.length,
        remaining_length: purchase.length,
        material: purchase.material,
        supplier: purchase.supplier,
        price: purchase.price,
        archived: false
      };

      const { error: insertError } = await supabase
        .from('stock')
        .insert(newStockItem);

      if (insertError) throw insertError;

      // Then, delete the future purchase
      const { error: deleteError } = await supabase
        .from('future_purchases')
        .delete()
        .eq('id', purchase.id);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      toast({
        title: "Transféré",
        description: "L'achat a été transféré au stock avec succès"
      });
      refetch();
    }
  });

  const handleAddPurchase = async (newItem: Omit<StockItem, 'remaining_length' | 'lot_number' | 'archived'>) => {
    try {
      const { error } = await supabase
        .from('future_purchases')
        .insert({
          type: newItem.type,
          width: newItem.width,
          height: newItem.height,
          diameter: newItem.diameter,
          length: newItem.length,
          material: newItem.material,
          supplier: newItem.supplier,
          price: newItem.price
        });

      if (error) throw error;

      refetch();
      
      toast({
        title: "Achat prévu ajouté",
        description: "L'achat prévu a été ajouté avec succès"
      });
    } catch (error) {
      console.error('Error adding future purchase:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'achat prévu.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Achats Prévus</h1>
        <Link to="/">
          <Button variant="outline">Retour au stock</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Longueur</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.type === 'rectangular' ? 'Rectangulaire' : 'Circulaire'}</TableCell>
                    <TableCell>
                      {purchase.type === 'rectangular' 
                        ? `${purchase.width}x${purchase.height} mm`
                        : `Ø${purchase.diameter} mm`
                      }
                    </TableCell>
                    <TableCell>{purchase.length} mm</TableCell>
                    <TableCell>{purchase.material}</TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>{purchase.price ? `${purchase.price}€` : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => transferToStockMutation.mutate(purchase)}
                        >
                          Transférer au stock
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePurchaseMutation.mutate(purchase.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold p-6 pb-0">Ajouter un achat prévu</h2>
            <AddStockForm 
              onAdd={handleAddPurchase} 
              nextLotNumber={0} 
              hideLength={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
