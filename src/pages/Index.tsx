
import React, { useState } from 'react';
import { AddStockForm } from '@/components/AddStockForm';
import { RemoveStockForm } from '@/components/RemoveStockForm';
import { StockTable } from '@/components/StockTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { StockItem } from '@/types/stock';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export default function Index() {
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const { toast } = useToast();

  const { data: items = [], refetch } = useQuery({
    queryKey: ['stock-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('archived', false)
        .order('lot_number', { ascending: true });
      
      if (error) throw error;

      // Transform the data to ensure type safety
      return data.map(item => ({
        ...item,
        type: item.type === 'rectangular' || item.type === 'circular' 
          ? item.type as 'rectangular' | 'circular'
          : 'rectangular' // Default to rectangular if invalid type
      })) as StockItem[];
    }
  });

  const nextLotNumber = items.length > 0 
    ? Math.max(...items.map(item => item.lot_number)) + 1 
    : 1;

  const handleAddStock = async (newItem: StockItem) => {
    try {
      const { data, error } = await supabase
        .from('stock')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      refetch();
      
      toast({
        title: "Stock ajouté",
        description: `Lot n°${newItem.lot_number} ajouté avec succès`
      });
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article au stock.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStock = async (lotNumber: number, newLength: number) => {
    try {
      const { error } = await supabase
        .from('stock')
        .update({ remaining_length: newLength })
        .eq('lot_number', lotNumber);

      if (error) throw error;

      refetch();
      
      toast({
        title: "Stock mis à jour",
        description: `Lot n°${lotNumber} mis à jour avec succès`
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le stock.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (filters: { [key: string]: string }) => {
    let filtered = [...items];

    if (filters.dimensions) {
      const searchDimensions = filters.dimensions.toLowerCase();
      filtered = filtered.filter(item => 
        (item.type === 'rectangular' && 
          `${item.width}x${item.height}`.includes(searchDimensions)) ||
        (item.type === 'circular' && 
          item.diameter?.toString().includes(searchDimensions))
      );
    }

    if (filters.material) {
      const searchMaterial = filters.material.toLowerCase();
      filtered = filtered.filter(item => 
        item.material.toLowerCase().includes(searchMaterial)
      );
    }

    if (filters.supplier) {
      const searchSupplier = filters.supplier.toLowerCase();
      filtered = filtered.filter(item => 
        item.supplier.toLowerCase().includes(searchSupplier)
      );
    }

    setFilteredItems(filtered);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion de Stock Matière</h1>
        <div className="space-x-4">
          <Link to="/withdrawals">
            <Button variant="outline">Historique des retraits</Button>
          </Link>
          <Link to="/low-stock">
            <Button variant="outline">Voir Stock Faible</Button>
          </Link>
          <Link to="/price-calculator">
            <Button variant="outline">Calculateur de prix</Button>
          </Link>
          <Link to="/future-purchases">
            <Button variant="outline">Achats prévus</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StockTable items={filteredItems.length > 0 ? filteredItems : items} onSearch={handleSearch} />
        </div>
        
        <div className="space-y-6">
          <Tabs defaultValue="remove" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Ajouter</TabsTrigger>
              <TabsTrigger value="remove">Retirer</TabsTrigger>
            </TabsList>
            <TabsContent value="add">
              <AddStockForm onAdd={handleAddStock} nextLotNumber={nextLotNumber} />
            </TabsContent>
            <TabsContent value="remove">
              <RemoveStockForm items={items} onRemove={handleRemoveStock} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
