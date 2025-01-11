import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { StockItem } from '@/types/stock';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface RemoveStockFormProps {
  items: StockItem[];
  onRemove: (lotNumber: number, newLength: number) => void;
}

export function RemoveStockForm({ items, onRemove }: RemoveStockFormProps) {
  const { toast } = useToast();
  const [lotNumber, setLotNumber] = useState('');
  const [newLength, setNewLength] = useState('');
  const [reference, setReference] = useState('');
  const [removeType, setRemoveType] = useState<'remaining' | 'removed'>('remaining');
  const [pieceName, setPieceName] = useState('');
  const [pieceQuantity, setPieceQuantity] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!reference.trim()) {
      toast({
        title: "Erreur",
        description: "La référence est requise",
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

    const quantityRemoved = removeType === 'remaining' 
      ? lot.remainingLength - numberNewLength
      : numberNewLength;

    // Calculate value of removed material
    const value = lot.price 
      ? (lot.price * quantityRemoved) / lot.length
      : 0;

    try {
      // Save withdrawal to Firestore
      await addDoc(collection(db, 'withdrawals'), {
        lotNumber: Number(lotNumber),
        quantity: quantityRemoved,
        reference,
        date: new Date(),
        material: lot.material,
        dimensions: lot.type === 'rectangular' 
          ? `${lot.width}x${lot.height} mm`
          : `Ø${lot.diameter} mm`,
        supplier: lot.supplier,
        value: value,
        ...(pieceName && pieceQuantity ? {
          pieceInfo: {
            name: pieceName,
            quantity: Number(pieceQuantity)
          }
        } : {})
      });

      onRemove(Number(lotNumber), finalLength);
      toast({
        title: "Stock mis à jour",
        description: `Lot n°${lotNumber} mis à jour avec succès`
      });

      // Reset form
      setLotNumber('');
      setNewLength('');
      setReference('');
      setPieceName('');
      setPieceQuantity('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement du retrait",
        variant: "destructive"
      });
    }
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
          <Label htmlFor="reference">Référence</Label>
          <Input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Référence du retrait"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pieceName">Nom de la pièce (optionnel)</Label>
          <Input
            id="pieceName"
            value={pieceName}
            onChange={(e) => setPieceName(e.target.value)}
            placeholder="Nom de la pièce créée"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pieceQuantity">Nombre de pièces (optionnel)</Label>
          <Input
            id="pieceQuantity"
            type="number"
            value={pieceQuantity}
            onChange={(e) => setPieceQuantity(e.target.value)}
            placeholder="Quantité de pièces"
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