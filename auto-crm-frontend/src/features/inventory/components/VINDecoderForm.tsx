import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Loader2, Save, Upload, X } from 'lucide-react';
import { InventoryList } from './InventoryList'; 
import api from '@/lib/api';

export const VINDecoderForm = () => {
  // 1. Search State
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  // --- NEW: REFRESH TRIGGER ---
  const [refreshKey, setRefreshKey] = useState(0); 
  
  // 2. The Form Data
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    body_style: '',
    vin: '',
    stock_number: '',
    color: 'Black',
    mileage: 0,
    cost_price: 0,
    selling_price: 0,
    status: 'AVAILABLE'
  });

  // --- Step 1: Decode VIN ---
  const handleDecode = async () => {
  if (!vin) return alert("Please enter a VIN");
  setLoading(true);
  try {
    // Just use the relative path; the base URL is added automatically
    const res = await api.post('/api/inventory/decode-vin/', { vin });
    
    setFormData(prev => ({
      ...prev,
      make: res.data.make || '',
      model: res.data.model || '',
      year: res.data.year || '',
      trim: res.data.trim || '',
      body_style: (res.data.body_style || '').slice(0, 50),
      vin: vin
    }));
  } catch (error) {
    alert("Failed to decode VIN. Check internet or VIN validity.");
  } finally {
    setLoading(false);
  }
};

// --- Step 2: Save to Database ---
const handleSave = async () => {
  try {
    if (!formData.stock_number || !formData.selling_price) {
      return alert("Please enter Stock Number and Selling Price");
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      // @ts-ignore
      data.append(key, formData[key]);
    });

    if (photo) {
      data.append('photo', photo);
    }

    // No need to manually add the Authorization Token anymore!
    // We only keep the multipart/form-data header because of the photo upload.
    await api.post('/api/inventory/vehicles/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    setRefreshKey(prev => prev + 1);

    setVin('');
    setPhoto(null);
    setFormData({
      make: '', model: '', year: '', trim: '', body_style: '', vin: '',
      stock_number: '', color: '', mileage: 0, cost_price: 0, selling_price: 0, status: 'AVAILABLE'
    });
    
  } catch (error: any) {
    console.error(error);
    // Cleaner error handling using optional chaining
    const errorMessage = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : "Server unreachable";
    alert("Error saving vehicle: " + errorMessage);
  }
};

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Shared Input Class to force Dark Mode
  const inputClass = "bg-apex-black border-apex-border text-white placeholder:text-gray-600 focus:border-apex-red focus:ring-1 focus:ring-apex-red";
  const readOnlyClass = "bg-apex-black/50 border-transparent text-apex-silver font-bold cursor-not-allowed";

  return (
    <div className="space-y-8"> 
      
      {/* --- TOP: STOCK-IN FORM --- */}
      {/* Removed shadow, used border for definition */}
      <Card className="w-full max-w-5xl mx-auto bg-apex-surface border border-apex-border shadow-none">
        
        <CardHeader className="bg-apex-blue border-b border-apex-border py-4 rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-white font-bold tracking-wide">
            <Box className="h-5 w-5 text-apex-red" />
            INVENTORY STOCK-IN
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          
          {/* SECTION 1: VIN DECODER */}
          <div className="flex flex-col md:flex-row gap-4 items-end bg-apex-black p-6 rounded-xl border border-apex-border">
            <div className="w-full max-w-md space-y-2">
              <Label htmlFor="vin" className="text-apex-silver font-bold uppercase text-xs tracking-wider">Step 1: Scan/Enter VIN</Label>
              <Input 
                id="vin" 
                placeholder="Enter 17-digit VIN" 
                value={vin}
                // Explicitly forcing dark background here
                className={`${inputClass} h-12 text-lg tracking-widest uppercase font-mono`}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
            </div>
            <Button onClick={handleDecode} disabled={loading} className="w-full md:w-auto mb-0.5 h-12 bg-apex-info hover:bg-blue-600 font-bold px-8 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "DECODE VIN"}
            </Button>
          </div>

          {/* SECTION 2: EDITABLE DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Car Details (Auto-Filled) */}
            <div className="space-y-5">
              <h4 className="font-bold text-apex-red border-b border-apex-border pb-2 uppercase text-sm tracking-wider">Vehicle Specs</h4>
              <div>
                <Label className="text-apex-muted">Year</Label>
                <Input value={formData.year} readOnly className={readOnlyClass} />
              </div>
              <div>
                <Label className="text-apex-muted">Make</Label>
                <Input value={formData.make} readOnly className={readOnlyClass} />
              </div>
              <div>
                <Label className="text-apex-muted">Model</Label>
                <Input value={formData.model} readOnly className={readOnlyClass} />
              </div>
              <div>
                <Label className="text-apex-muted">Trim</Label>
                <Input value={formData.trim} onChange={(e) => handleChange('trim', e.target.value)} className={inputClass} />
              </div>
              
              {/* PHOTO UPLOAD SECTION */}
              <div className="pt-2">
                  <Label className="mb-2 block text-apex-muted">Vehicle Photo</Label>
                  <div className="border-2 border-dashed border-apex-border rounded-xl p-4 text-center hover:bg-apex-black transition-colors relative group bg-apex-black/30">
                      <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          id="car-photo-upload"
                          onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                  setPhoto(e.target.files[0]);
                              }
                          }} 
                      />
                      
                      {photo ? (
                          <div className="relative">
                              <img 
                                  src={URL.createObjectURL(photo)} 
                                  alt="Preview" 
                                  className="w-full h-32 object-cover rounded-md border border-apex-border" 
                              />
                              <button 
                                  onClick={(e) => {
                                      e.preventDefault();
                                      setPhoto(null);
                                  }}
                                  className="absolute top-1 right-1 bg-apex-error text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                              >
                                  <X className="h-3 w-3" />
                              </button>
                          </div>
                      ) : (
                          <label htmlFor="car-photo-upload" className="cursor-pointer flex flex-col items-center justify-center py-4">
                              <Upload className="h-8 w-8 text-apex-muted group-hover:text-apex-red transition-colors mb-2" />
                              <span className="text-sm text-apex-muted group-hover:text-white transition-colors">Click to upload image</span>
                          </label>
                      )}
                  </div>
              </div>
            </div>

            {/* Column 2: Inventory Details (Manual) */}
            <div className="space-y-5">
              <h4 className="font-bold text-apex-red border-b border-apex-border pb-2 uppercase text-sm tracking-wider">Inventory Data</h4>
              <div>
                <Label className="text-apex-muted">Stock Number *</Label>
                <Input 
                  placeholder="e.g. STK-1001" 
                  value={formData.stock_number}
                  className={`${inputClass} font-mono`}
                  onChange={(e) => handleChange('stock_number', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-apex-muted">Color</Label>
                <Input 
                  placeholder="e.g. Midnight Black" 
                  value={formData.color}
                  className={inputClass}
                  onChange={(e) => handleChange('color', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-apex-muted">Mileage (km)</Label>
                <Input 
                  type="number"
                  value={formData.mileage}
                  className={inputClass}
                  onChange={(e) => handleChange('mileage', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Column 3: Financials (Manual) */}
            <div className="space-y-5">
              <h4 className="font-bold text-apex-red border-b border-apex-border pb-2 uppercase text-sm tracking-wider">Financials</h4>
              <div>
                <Label className="text-apex-muted">Cost Price ($)</Label>
                <Input 
                  type="number"
                  value={formData.cost_price}
                  className={inputClass}
                  onChange={(e) => handleChange('cost_price', Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-apex-muted">Selling Price ($) *</Label>
                <Input 
                  type="number"
                  // Explicitly overriding styles for the Price field to make it Green
                  className="bg-apex-black border-apex-success/30 text-apex-success font-bold focus:ring-apex-success"
                  value={formData.selling_price}
                  onChange={(e) => handleChange('selling_price', Number(e.target.value))}
                />
              </div>
              
              <div className="pt-8">
                <Button onClick={handleSave} className="w-full bg-apex-red hover:bg-red-600 h-14 text-lg font-black tracking-wide shadow-none text-white border border-transparent hover:border-white/20">
                  <Save className="mr-2 h-5 w-5" /> SAVE VEHICLE
                </Button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* --- BOTTOM: INVENTORY LIST --- */}
      <div className="pt-8 border-t border-apex-border/50">
          <h2 className="text-2xl font-black text-white mb-6 pl-1 tracking-tight uppercase">Current Inventory</h2>
          <InventoryList key={refreshKey} />
      </div>

    </div>
  );
};