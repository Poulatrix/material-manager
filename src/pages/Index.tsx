import React, { useState } from 'react';
import { AddStockForm, StockItem } from '@/components/AddStockForm';
import { RemoveStockForm } from '@/components/RemoveStockForm';
import { StockTable } from '@/components/StockTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Index() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [nextLotNumber, setNextLotNumber] = useState(1);

  const handleAddStock = (newItem: StockItem) => {
    setItems(prev => [...prev, newItem]);
    setFilteredItems(prev => [...prev, newItem]);
    setNextLotNumber(prev => prev + 1);
  };

  const handleRemoveStock = (lotNumber: number, newLength: number) => {
    const updatedItems = items.map(item => 
      item.lotNumber === lotNumber 
        ? { ...item, remainingLength: newLength }
        : item
    );
    setItems(updatedItems);
    setFilteredItems(updatedItems);
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm) {
      setFilteredItems(items);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = items.filter(item => 
      item.material.toLowerCase().includes(lowerSearchTerm) ||
      item.supplier.toLowerCase().includes(lowerSearchTerm) ||
      item.lotNumber.toString().includes(lowerSearchTerm) ||
      (item.type === 'rectangular' && 
        (`${item.width}x${item.height}`).includes(searchTerm)) ||
      (item.type === 'circular' && 
        item.diameter?.toString().includes(searchTerm))
    );
    setFilteredItems(filtered);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion de Stock Matière</h1>
        <Link to="/low-stock">
          <Button variant="outline">Voir Stock Faible</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StockTable items={filteredItems} onSearch={handleSearch} />
        </div>
        
        <div className="space-y-6">
          <Tabs defaultValue="add" className="w-full">
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