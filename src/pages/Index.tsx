import React, { useState, useEffect } from 'react';
import { AddStockForm } from '@/components/AddStockForm';
import { RemoveStockForm } from '@/components/RemoveStockForm';
import { StockTable } from '@/components/StockTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { StockItem } from '@/types/stock';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

export default function Index() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [nextLotNumber, setNextLotNumber] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const loadStockItems = async () => {
      try {
        console.log('Loading stock items from Firestore...');
        const q = query(collection(db, 'stock'), orderBy('lotNumber', 'asc'));
        const querySnapshot = await getDocs(q);
        const stockItems: StockItem[] = [];
        let maxLotNumber = 0;

        querySnapshot.forEach((doc) => {
          const item = { ...doc.data(), id: doc.id } as StockItem;
          if (!item.archived) {
            stockItems.push(item);
          }
          // Prendre en compte tous les lots, même archivés, pour le numéro suivant
          maxLotNumber = Math.max(maxLotNumber, item.lotNumber);
        });

        console.log('Loaded stock items:', stockItems);
        setItems(stockItems);
        setFilteredItems(stockItems);
        setNextLotNumber(maxLotNumber + 1);
      } catch (error) {
        console.error('Error loading stock items:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du stock",
          variant: "destructive"
        });
      }
    };

    loadStockItems();
  }, [toast]);

  const handleAddStock = async (newItem: StockItem) => {
    try {
      console.log('Adding new stock item:', newItem);
      const docRef = await addDoc(collection(db, 'stock'), newItem);
      const itemWithId = { ...newItem, id: docRef.id };
      
      setItems(prev => [...prev, itemWithId]);
      setFilteredItems(prev => [...prev, itemWithId]);
      setNextLotNumber(prev => prev + 1);
      
      toast({
        title: "Stock ajouté",
        description: `Lot n°${newItem.lotNumber} ajouté avec succès`
      });
    } catch (error) {
      console.error('Error adding stock item:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article au stock",
        variant: "destructive"
      });
    }
  };

  const handleRemoveStock = async (lotNumber: number, newLength: number) => {
    try {
      console.log('Updating stock item:', { lotNumber, newLength });
      const itemToUpdate = items.find(item => item.lotNumber === lotNumber);
      
      if (!itemToUpdate || !itemToUpdate.id) {
        throw new Error('Item not found');
      }

      await updateDoc(doc(db, 'stock', itemToUpdate.id), {
        remainingLength: newLength
      });

      const updatedItems = items.map(item => 
        item.lotNumber === lotNumber 
          ? { ...item, remainingLength: newLength }
          : item
      );
      
      setItems(updatedItems);
      setFilteredItems(updatedItems);
      
      toast({
        title: "Stock mis à jour",
        description: `Lot n°${lotNumber} mis à jour avec succès`
      });
    } catch (error) {
      console.error('Error updating stock item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le stock",
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
          <Link to="/references">
            <Button variant="outline">Références Matière</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StockTable items={filteredItems} onSearch={handleSearch} />
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