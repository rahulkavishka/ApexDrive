import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Loader2, ChevronDown } from 'lucide-react';

interface Vehicle {
  id: number;
  stock_number: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  color: string;
  mileage: number;
  cost_price: string;
  selling_price: string;
  status: string;
  vin: string;
}

interface EditModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditVehicleModal = ({ vehicle, isOpen, onClose, onSuccess }: EditModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    selling_price: vehicle.selling_price,
    cost_price: vehicle.cost_price || 0,
    mileage: vehicle.mileage,
    status: vehicle.status,
    color: vehicle.color
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      // Define the base URL from environment variables
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      await axios.patch(`${API_BASE_URL}/api/inventory/vehicles/${vehicle.id}/`, formData);

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update vehicle.");
    } finally {
      setLoading(false);
    }
  };

  // Shared dark styles
  const inputClass = "bg-apex-black border-apex-border text-white placeholder:text-gray-600 focus:border-apex-red focus:ring-1 focus:ring-apex-red";

  return (
    // Dark Overlay with Blur
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      {/* Modal Card - Apex Dark Theme */}
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 bg-apex-surface border border-apex-border">

        <CardHeader className="flex flex-row items-center justify-between border-b border-apex-border py-4 bg-apex-blue/50 rounded-t-xl">
          <CardTitle className="text-white">Edit {vehicle.year} {vehicle.model}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-apex-red hover:text-white text-apex-muted">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-5 pt-6 bg-apex-surface rounded-b-xl">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-apex-muted">Selling Price ($)</Label>
              <Input
                type="number"
                value={formData.selling_price}
                className="bg-apex-black border-apex-success/30 text-apex-success font-bold focus:ring-apex-success"
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-apex-muted">Cost Price ($)</Label>
              <Input
                type="number"
                value={formData.cost_price}
                className={inputClass}
                onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-apex-muted">Current Mileage (km)</Label>
            <Input
              type="number"
              value={formData.mileage}
              className={inputClass}
              onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
            />
          </div>

          {/* MODERN DROPDOWN */}
          <div className="space-y-2">
            <Label className="text-apex-muted">Status</Label>
            <div className="relative">
              <select
                className="flex h-10 w-full appearance-none rounded-md border border-apex-border bg-apex-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-apex-red"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
                <option value="SERVICE">In Service</option>
              </select>
              {/* Custom Arrow Icon */}
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-apex-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <Button variant="outline" className="flex-1 border-apex-border text-apex-muted hover:bg-apex-black hover:text-white" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-apex-red hover:bg-red-600 text-white font-bold" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};