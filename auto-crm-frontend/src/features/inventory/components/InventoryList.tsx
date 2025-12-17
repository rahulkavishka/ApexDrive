import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, CarFront, RefreshCw, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { EditVehicleModal } from './EditVehicleModal'; 

// Updated Interface to include cost_price
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
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'SERVICE';
  photo: string | null;
  vin: string;
}

export const InventoryList = () => {
  // --- 1. USE YOUR EXISTING AUTH CONTEXT ---
  const { user, isManager } = useAuth(); 
  
  // State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/inventory/vehicles/');
      setVehicles(res.data);
    } catch (error) {
      console.error("Failed to load inventory", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // --- DELETE FUNCTION (Manager Only) ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:8000/api/inventory/vehicles/${id}/`);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      alert("Failed to delete vehicle");
    }
  };

  // --- EDIT TRIGGER ---
  const handleEditClick = (car: Vehicle) => {
    setEditingVehicle(car);
    setIsModalOpen(true);
  };

  // Filter Logic
  const filteredVehicles = vehicles.filter((car) => {
    const matchesStatus = statusFilter === 'ALL' || car.status === statusFilter;
    const searchString = `${car.year} ${car.make} ${car.model} ${car.vin} ${car.stock_number}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8000${path}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <Badge className="bg-apex-success text-white hover:bg-green-600">Available</Badge>;
      case 'SOLD': return <Badge className="bg-apex-error text-white hover:bg-red-600">Sold</Badge>;
      case 'RESERVED': return <Badge className="bg-apex-warning text-white hover:bg-orange-600">Reserved</Badge>;
      default: return <Badge variant="secondary" className="bg-apex-gray text-white">{status}</Badge>;
    }
  };

  // Permissions
  const canEdit = !!user;
  const canDelete = isManager;

  return (
    <div className="space-y-6">
      
      {/* 1. EDIT MODAL */}
      {editingVehicle && (
        <EditVehicleModal 
          vehicle={editingVehicle}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchInventory}
        />
      )}

      {/* HEADER FILTERS - Styled Dark */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-apex-surface p-4 rounded-xl shadow-lg border border-apex-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-apex-muted" />
          <Input 
            placeholder="Search Make, Model, VIN..." 
            className="pl-10 bg-apex-black border-apex-border text-white placeholder:text-gray-500 focus:ring-apex-red focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {/* Modern Status Filter */}
          <div className="relative">
            <select 
              className="h-10 appearance-none rounded-md border border-apex-border bg-apex-black pl-3 pr-8 text-sm text-white focus:outline-none focus:ring-1 focus:ring-apex-red cursor-pointer transition-shadow"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
            </select>
            
            {/* Custom Arrow Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-apex-muted">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <Button variant="outline" size="icon" onClick={fetchInventory} className="bg-apex-black border-apex-border text-white hover:bg-apex-gray hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="text-center py-20 text-apex-muted animate-pulse">Loading Inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVehicles.map((car) => (
            // CARD - Dark Theme
            <Card key={car.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group relative bg-apex-surface border-apex-border hover:border-apex-gray">
              
              {/* IMAGE */}
              <div className="relative h-48 bg-apex-black flex items-center justify-center overflow-hidden border-b border-apex-border">
                {car.photo ? (
                  <img 
                    src={getImageUrl(car.photo)!} 
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                ) : (
                  <div className="text-apex-muted/30 flex flex-col items-center">
                    <CarFront className="h-12 w-12 mb-2" />
                    <span className="text-xs uppercase tracking-widest">No Photo</span>
                  </div>
                )}
                
                {/* ACTIONS OVERLAY */}
                {(canEdit || canDelete) && (
                    <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      
                      {/* Edit Button */}
                      {canEdit && (
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8 bg-apex-black/80 hover:bg-apex-blue text-white shadow-md border border-white/10 backdrop-blur-sm" 
                          onClick={() => handleEditClick(car)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Delete Button */}
                      {canDelete && (
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="h-8 w-8 shadow-md border border-red-500/50 bg-red-900/80 hover:bg-red-700 backdrop-blur-sm"
                          onClick={() => handleDelete(car.id)}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                      )}
                    </div>
                )}

                {/* PRICE TAG */}
                <div className="absolute bottom-0 right-0 bg-apex-blue text-white px-3 py-1 text-sm font-black rounded-tl-lg shadow-lg border-t border-l border-apex-border">
                  ${Number(car.selling_price).toLocaleString()}
                </div>
              </div>

              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-white leading-tight group-hover:text-apex-red transition-colors">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <p className="text-xs text-apex-silver mt-0.5">{car.trim}</p>
                  </div>
                  {getStatusBadge(car.status)}
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-sm text-apex-muted mt-4 border-t border-apex-border pt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-apex-silver tracking-wider font-bold">Stock #</span>
                    <span className="font-mono text-white">{car.stock_number}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase text-apex-silver tracking-wider font-bold">Mileage</span>
                    <span className="font-mono text-white">{car.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="col-span-2 flex flex-col mt-2">
                      <span className="text-[10px] uppercase text-apex-silver tracking-wider font-bold">VIN</span>
                      <span className="font-mono text-xs text-apex-muted truncate">{car.vin}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};