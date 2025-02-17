
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { StockItem } from '@/types/stock';

interface AddStockFormProps {
  onAdd: (item: StockItem) => void;
  nextLotNumber: number;
}

export function AddStockForm({ onAdd, nextLotNumber }: AddStockFormProps) {
  const [type, setType] = useState<'rectangular' | 'circular'>('rectangular');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [diameter, setDiameter] = useState('');
  const [length, setLength] = useState('');
  const [material, setMaterial] = useState('');
  const [supplier, setSupplier] = useState('');
  const [price, setPrice] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!material || !length || !supplier || 
      (type === 'rectangular' && (!width || !height)) || 
      (type === 'circular' && !diameter)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    const newItem: StockItem = {
      lot_number: nextLotNumber,
      type,
      length: Number(length),
      material,
      supplier,
      remaining_length: Number(length),
      price: price ? Number(price) : undefined,
      ...(type === 'rectangular' 
        ? { width: Number(width), height: Number(height) }
        : { diameter: Number(diameter) }
      )
    };

    onAdd(newItem);

    // Reset form
    setWidth('');
    setHeight('');
    setDiameter('');
    setLength('');
    setMaterial('');
    setSupplier('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow">
      <RadioGroup 
        value={type} 
        onValueChange={(value: 'rectangular' | 'circular') => setType(value)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="rectangular" id="rectangular" />
          <Label htmlFor="rectangular">Rectangulaire</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="circular" id="circular" />
          <Label htmlFor="circular">Circulaire</Label>
        </div>
      </RadioGroup>

      {type === 'rectangular' ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Largeur (mm)</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="Largeur"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Hauteur (mm)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Hauteur"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="diameter">Diamètre (mm)</Label>
          <Input
            id="diameter"
            type="number"
            value={diameter}
            onChange={(e) => setDiameter(e.target.value)}
            placeholder="Diamètre"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="length">Longueur (mm)</Label>
        <Input
          id="length"
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="Longueur"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="material">Matière</Label>
        <Input
          id="material"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder="Ex: Acier, Aluminium..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Prix d'achat (€)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Prix d'achat"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Fournisseur</Label>
        <Input
          id="supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Nom du fournisseur"
        />
      </div>

      <Button type="submit" className="w-full">
        Ajouter au stock
      </Button>
    </form>
  );
}
