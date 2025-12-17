import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { BillOfSale } from "./BillOfSale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Search, Save, User, Printer, ChevronDown } from "lucide-react";

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string;
  stock_number: string;
  selling_price: string;
  status: string;
  vin: string;
}

export const DeskingCalculator = () => {
  // --- STATE ---
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculator State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehiclePrice, setPrice] = useState(0);
  const [downPayment, setDownPayment] = useState(2000);
  const [interestRate, setRate] = useState(5.9);
  const [months, setMonths] = useState(60);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  // Customer State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Lead Source State
  const [newLead, setNewLead] = useState({
    source: 'Walk-in'
  });

  // --- PRINTING CONFIGURATION ---
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  // --- 1. FETCH VEHICLES ---
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/inventory/vehicles/");
        const availableCars = res.data.filter((v: Vehicle) => v.status === 'AVAILABLE');
        setVehicles(availableCars);
      } catch (error) {
        console.error("Could not load inventory", error);
      }
    };
    fetchVehicles();
  }, []);

  // --- 2. LOGIC ---
  const selectCar = (car: Vehicle) => {
    setSelectedVehicle(car);
    setPrice(Number(car.selling_price));
    setSearchTerm(`${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim() || car.stock_number);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (!months || months === 0) {
      setMonthlyPayment(0);
      return;
    }
    const principal = vehiclePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;

    if (principal <= 0) {
      setMonthlyPayment(0);
      return;
    }

    if (monthlyRate === 0) {
      setMonthlyPayment(principal / months);
    } else {
      const payment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

      if (isNaN(payment) || !isFinite(payment)) setMonthlyPayment(0);
      else setMonthlyPayment(payment);
    }
  }, [vehiclePrice, downPayment, interestRate, months]);

  // --- 3. SAVE DEAL ---
  const handleSaveDeal = async () => {
    if (!selectedVehicle) return alert("Please select a vehicle first.");
    if (!customerName || !customerPhone) return alert("Please enter customer details.");

    if (selectedVehicle.status !== 'AVAILABLE') {
      return alert(`This vehicle is currently ${selectedVehicle.status}. Cannot negotiate.`);
    }

    try {
      await axios.post("http://localhost:8000/api/sales/leads/", {
        first_name: customerName.split(" ")[0],
        last_name: customerName.split(" ")[1] || "",
        phone: customerPhone,
        source: newLead.source,
        vehicle: selectedVehicle.id,
        status: "NEGOTIATION",
        quoted_price: vehiclePrice,
        down_payment: downPayment,
        monthly_payment: monthlyPayment.toFixed(2),
        term_months: months,
        notes: `Deal Structure: Price $${vehiclePrice}, Down $${downPayment}, Rate ${interestRate}%, Term ${months}mo.`
      });

      await axios.patch(`http://localhost:8000/api/inventory/vehicles/${selectedVehicle.id}/`, {
        status: 'RESERVED'
      });

      alert("Deal Saved! Lead created and Vehicle marked as RESERVED. 📝");

      setCustomerName("");
      setCustomerPhone("");
      setNewLead({ source: 'Walk-in' });
      setSearchTerm("");
      setSelectedVehicle(null);

    } catch (error) {
      console.error(error);
      alert("Failed to save deal.");
    }
  };

  const filteredVehicles = vehicles.filter(car => {
    const searchString = `${car.year} ${car.make} ${car.model} ${car.stock_number} ${car.vin}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // Shared Dark Input Class
  const inputClass = "bg-apex-black border-apex-border text-white placeholder:text-gray-600 focus:border-apex-red focus:ring-1 focus:ring-apex-red";

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* --- HIDDEN PRINT DOCUMENT --- */}
      <div style={{ display: "none" }}>
        <BillOfSale
          ref={componentRef}
          vehicle={selectedVehicle}
          customer={{ name: customerName, phone: customerPhone }}
          financials={{
            price: vehiclePrice,
            down: downPayment,
            apr: interestRate,
            term: months,
            payment: monthlyPayment.toFixed(2)
          }}
        />
      </div>

      {/* LEFT: CALCULATOR */}
      <Card className="w-full lg:w-2/3 shadow-xl border border-apex-border bg-apex-surface">
        <CardHeader className="bg-apex-blue border-b border-apex-border rounded-t-xl py-4">
          <CardTitle className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-apex-red" />
              <span>DESKING TOOL</span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">

          {/* SEARCH */}
          <div className="relative z-10">
            <Label className="text-apex-silver font-semibold mb-2 block uppercase text-xs tracking-wider">Find Vehicle (VIN, Name, or Stock #)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-apex-muted" />
              <Input
                placeholder="Search Stock # or Name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className={`pl-10 ${inputClass}`}
              />
            </div>

            {/* DROPDOWN RESULTS - Dark Theme */}
            {isDropdownOpen && filteredVehicles.length > 0 && (
              <div className="absolute w-full bg-apex-surface border border-apex-border rounded-md shadow-2xl max-h-60 overflow-y-auto mt-1 z-50">
                {filteredVehicles.map((car) => (
                  <div
                    key={car.id}
                    className="p-3 hover:bg-apex-black cursor-pointer border-b border-apex-border/50 last:border-0 transition-colors"
                    onClick={() => selectCar(car)}
                  >
                    <div className="font-bold text-white">
                      {car.year} {car.make} {car.model} <span className="text-apex-success ml-2 font-mono">${car.selling_price}</span>
                    </div>
                    <div className="text-xs text-apex-muted flex gap-2">
                      <span>VIN: {car.vin || 'N/A'}</span>
                      <span>Stock: {car.stock_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <Label className="text-apex-muted">Vehicle Price</Label>
                <Input type="number" className={inputClass} value={vehiclePrice} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-apex-muted">Down Payment</Label>
                <Input type="number" className={inputClass} value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-apex-muted">APR %</Label>
                  <Input type="number" className={inputClass} step="0.1" value={interestRate} onChange={(e) => setRate(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-apex-muted">Months</Label>
                  <Input type="number" className={inputClass} step="12" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* RESULT */}
            <div className="flex flex-col justify-center items-center bg-apex-black rounded-xl border border-apex-border p-6 shadow-inner">
              <p className="text-apex-silver font-bold uppercase tracking-widest text-xs mb-2">Monthly Payment</p>

              {/* UPDATED: Display full amount on one line */}
              <h2 className="text-5xl font-black text-white tracking-tighter">
                ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>

              {/* Removed the separate <p> tag for cents */}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* RIGHT: CUSTOMER SAVE FORM */}
      <Card className="w-full lg:w-1/3 shadow-xl border border-apex-success/30 h-fit bg-apex-surface">
        <CardHeader className="bg-apex-success/10 border-b border-apex-success/20 rounded-t-xl py-4">
          <CardTitle className="text-apex-success flex items-center gap-2">
            <User className="h-5 w-5" /> Customer Info
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-apex-muted">Full Name</Label>
            <Input
              placeholder="e.g. Michael Scott"
              value={customerName}
              className={inputClass}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-apex-muted">Phone Number</Label>
            <Input
              placeholder="(555) 123-4567"
              value={customerPhone}
              className={inputClass}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-apex-muted">Lead Source</Label>
            <div className="relative">
              <select
                className="flex h-10 w-full appearance-none rounded-md border border-apex-border bg-apex-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-apex-red transition-shadow"
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Facebook">Facebook</option>
                <option value="Google">Google</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
              </select>
              {/* Custom Arrow Icon */}
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-apex-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-3">
            {/* PRINT BUTTON */}
            <Button
              variant="outline"
              className="w-full border-apex-border text-apex-muted hover:bg-apex-black hover:text-white h-auto py-4"
              onClick={() => handlePrint()}
              disabled={!selectedVehicle}
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>

            {/* SAVE BUTTON */}
            <Button onClick={handleSaveDeal} className="w-full bg-apex-success hover:bg-green-600 text-white font-bold h-auto py-4 shadow-lg shadow-apex-success/20">
              <Save className="mr-2 h-4 w-4" /> Save Deal
            </Button>
          </div>
          <p className="text-[10px] text-center text-apex-muted mt-2 uppercase tracking-widest opacity-60">
            Actions sync to Leads Database
          </p>
        </CardContent>
      </Card>
    </div>
  );
};