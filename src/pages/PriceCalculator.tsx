
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export default function PriceCalculator() {
  const [diameter, setDiameter] = useState('');
  const [length, setLength] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: stockItems } = useQuery({
    queryKey: ['stock-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('archived', false);
      
      if (error) throw error;
      return data;
    }
  });

  const calculatePrice = () => {
    if (!selectedItem || !length) return null;
    
    const requestedLength = parseFloat(length);
    const pricePerUnit = selectedItem.price / selectedItem.length;
    const basePrice = pricePerUnit * requestedLength;
    const marginPrice = basePrice * 1.3; // 30% margin
    
    return {
      basePrice: basePrice.toFixed(2),
      marginPrice: marginPrice.toFixed(2)
    };
  };

  const filteredItems = stockItems?.filter(item => {
    if (!diameter) return false;
    return item.type === 'circular' && item.diameter === parseFloat(diameter);
  });
      
  const prices = calculatePrice();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Calculateur de Prix</h1>
        <Link to="/">
          <Button variant="outline">Retour au stock</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diameter">Diamètre (mm)</Label>
            <Input
              id="diameter"
              type="number"
              value={diameter}
              onChange={(e) => {
                setDiameter(e.target.value);
                setSelectedItem(null);
              }}
              placeholder="Ex: 20"
            />
          </div>

          {filteredItems && filteredItems.length > 0 && (
            <div className="space-y-2">
              <Label>Matières disponibles</Label>
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={selectedItem?.id === item.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.material} - {item.supplier} (Lot n°{item.lot_number})
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedItem && (
            <div className="space-y-2">
              <Label htmlFor="length">Longueur désirée (mm)</Label>
              <Input
                id="length"
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Ex: 150"
              />
            </div>
          )}
        </Card>

        {prices && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Résultat</h2>
            <div className="space-y-2">
              <p className="text-gray-600">Prix de revient :</p>
              <p className="text-2xl font-bold">{prices.basePrice} €</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">Prix avec marge (30%) :</p>
              <p className="text-2xl font-bold text-green-600">{prices.marginPrice} €</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
