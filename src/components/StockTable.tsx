
import React from 'react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StockItem } from '@/types/stock';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface StockTableProps {
  items: StockItem[];
  onSearch: (filters: { [key: string]: string }) => void;
}

export function StockTable({ items, onSearch }: StockTableProps) {
  const { toast } = useToast();
  const [filters, setFilters] = React.useState({
    dimensions: '',
    material: '',
    supplier: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleArchive = async (item: StockItem) => {
    if (!item.id) return;

    try {
      const { error } = await supabase
        .from('stock')
        .update({ archived: true })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Lot archivé",
        description: `Le lot n°${item.lot_number} a été archivé avec succès`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver le lot",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Rechercher par dimensions..."
          value={filters.dimensions}
          onChange={(e) => handleFilterChange('dimensions', e.target.value)}
          className="w-full"
        />
        <Input
          placeholder="Rechercher par matière..."
          value={filters.material}
          onChange={(e) => handleFilterChange('material', e.target.value)}
          className="w-full"
        />
        <Input
          placeholder="Rechercher par fournisseur..."
          value={filters.supplier}
          onChange={(e) => handleFilterChange('supplier', e.target.value)}
          className="w-full"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Lot</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Longueur initiale</TableHead>
              <TableHead>Longueur restante</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.filter(item => !item.archived).map((item) => (
              <TableRow key={item.lot_number}>
                <TableCell>{item.lot_number}</TableCell>
                <TableCell>{item.type === 'rectangular' ? 'Rectangulaire' : 'Circulaire'}</TableCell>
                <TableCell>
                  {item.type === 'rectangular' 
                    ? `${item.width}x${item.height} mm`
                    : `Ø${item.diameter} mm`
                  }
                </TableCell>
                <TableCell>{item.length} mm</TableCell>
                <TableCell>{item.remaining_length} mm</TableCell>
                <TableCell>{item.material}</TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchive(item)}
                    className="text-sm"
                  >
                    Archiver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
