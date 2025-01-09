import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { StockItem } from './AddStockForm';

interface RemoveStockFormProps {
  items: StockItem[];
  onRemove: (lotNumber: number, newLength: number) => void;
}

export function RemoveStockForm({ items, onRemove }: RemoveStockFormProps) {
  const { toast } = useToast();
  const [lotNumber, setLotNumber] = useState('');
  const [newLength, setNewLength] = useState('');
  const [removeType, setRemoveType] = useState<'remaining' | 'removed'>('remaining');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lot = items.find(item => item.lotNumber === Number(lotNumber));
    if (!lot) {
      toast({
        title: "Erreur",
        description: "Numéro de lot invalide",
        variant: "destructive"
      });
      return;
    }

    const numberNewLength = Number(newLength);
    if (numberNewLength < 0 || numberNewLength > lot.length) {
      toast({
        title: "Erreur",
        description: "Longueur invalide",
        variant: "destructive"
      });
      return;
    }

    const finalLength = removeType === 'remaining' 
      ? numberNewLength 
      : lot.remainingLength - numberNewLength;

    if (finalLength < 0) {
      toast({
        title: "Erreur",
        description: "Longueur restante ne peut pas être négative",
        variant: "destructive"
      });
      return;
    }

    onRemove(Number(lotNumber), finalLength);
    toast({
      title: "Stock mis à jour",
      description: `Lot n°${lotNumber} mis à jour avec succès`
    });

    // Reset form
    setLotNumber('');
    setNewLength('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lotNumber">Numéro de lot</Label>
          <Input
            id="lotNumber"
            type="number"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            placeholder="N° de lot"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="removeType">Type de retrait</Label>
          <select
            id="removeType"
            value={removeType}
            onChange={(e) => setRemoveType(e.target.value as 'remaining' | 'removed')}
            className="w-full p-2 border rounded"
          >
            <option value="remaining">Longueur restante</option>
            <option value="removed">Longueur retirée</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newLength">
            {removeType === 'remaining' ? 'Longueur restante (mm)' : 'Longueur retirée (mm)'}
          </Label>
          <Input
            id="newLength"
            type="number"
            value={newLength}
            onChange={(e) => setNewLength(e.target.value)}
            placeholder="Longueur"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Mettre à jour le stock
      </Button>
    </form>
  );
}