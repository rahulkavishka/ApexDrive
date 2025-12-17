import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, Upload, User, History, Save, CheckCircle, AlertCircle, Search, Clock, Loader2, DollarSign, Printer, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReactToPrint } from 'react-to-print';
import { PrintableJobCard } from './PrintableJobCard';
import { PrintableInvoice } from './PrintableInvoice';


// --- TYPES ---
interface ServiceRecord {
  id: number;
  date: string;
  description: string;
  status: string;
  vehicle_details?: {
    license_plate: string;
    model: string;
    make: string;
  };
}

interface VehicleData {
  id: number;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  owner: number;
  history: ServiceRecord[];
}

export const LicensePlateScanner = () => {
  // --- STATE: SCANNER ---
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- STATE: RESULTS ---
  const [detectedPlate, setDetectedPlate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [existingVehicle, setExistingVehicle] = useState<VehicleData | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // --- STATE: MANUAL INPUT ---
  const [manualPlate, setManualPlate] = useState("");

  // --- STATE: FORMS ---
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', make: '', model: '', year: '' });
  const [newJob, setNewJob] = useState("");

  // --- STATE: ACTIVE QUEUE ---
  const [activeJobs, setActiveJobs] = useState<ServiceRecord[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchActiveJobs();
  }, []);

  // --- 1. FETCH ACTIVE JOBS ---
  const fetchActiveJobs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/service/records/");
      const todayStr = new Date().toDateString();

      const todaysJobs = res.data.filter((job: any) => {
        const jobDate = new Date(job.date).toDateString();
        return jobDate === todayStr; 
      });

      const sorted = todaysJobs.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setActiveJobs(sorted);
    } catch (error) {
      console.error("Failed to load jobs", error);
    }
  };

  // --- 2. UPDATE JOB STATUS ---
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setActiveJobs(activeJobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
      await axios.patch(`http://localhost:8000/api/service/records/${id}/`, { status: newStatus });
    } catch (error) {
      console.error("Update failed");
      fetchActiveJobs(); 
    }
  };

  // --- 3. HANDLE IMAGE UPLOAD ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectedPlate("");
      setExistingVehicle(null);
      setIsNewCustomer(false);
    }
  };

  // --- 4. AI SCAN ---
  const handleScan = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const res = await axios.post('http://localhost:8000/api/service/scan-plate/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      processScanResult(res.data.plate, res.data.existing_vehicle);
    } catch (error) {
      console.error(error);
      alert("Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. MANUAL SEARCH ---
  const handleManualSearch = async () => {
    if (!manualPlate) return;
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/service/vehicles/');
      const vehicles: VehicleData[] = res.data;

      const found = vehicles.find(v =>
        v.license_plate.toUpperCase() === manualPlate.toUpperCase()
      );

      processScanResult(manualPlate.toUpperCase(), found || null);
    } catch (error) {
      alert("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  // Helper Logic
  const processScanResult = (plate: string, vehicle: VehicleData | null) => {
    setDetectedPlate(plate);
    if (vehicle) {
      setExistingVehicle(vehicle);
      setIsNewCustomer(false);
    } else {
      setExistingVehicle(null);
      setIsNewCustomer(true);
      setNewCustomer(prev => ({ ...prev, make: 'Unknown', model: 'Unknown' }));
    }
  };

  // --- 6. REGISTER NEW CUSTOMER ---
  const handleRegister = async () => {
    try {
      const custRes = await axios.post('http://localhost:8000/api/service/customers/', {
        name: newCustomer.name,
        phone: newCustomer.phone
      });

      const vehRes = await axios.post('http://localhost:8000/api/service/vehicles/', {
        license_plate: detectedPlate,
        make: newCustomer.make,
        model: newCustomer.model,
        year: newCustomer.year || 2020,
        owner: custRes.data.id
      });

      alert("Customer Registered! ✅");
      setExistingVehicle(vehRes.data);
      setIsNewCustomer(false);
    } catch (error) {
      alert("Error registering customer.");
    }
  };

  // --- 7. CREATE SERVICE JOB ---
  const handleCreateJob = async () => {
    if (!existingVehicle || !newJob) return;
    try {
      await axios.post('http://localhost:8000/api/service/records/', {
        vehicle: existingVehicle.id,
        description: newJob,
        status: 'PENDING'
      });
      alert("Service Job Created! 🛠️");
      setNewJob("");
      fetchActiveJobs(); 
    } catch (error) {
      alert("Could not save job.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return "bg-apex-success text-white border-apex-success/20";
      case 'IN_PROGRESS': return "bg-apex-info text-white border-apex-info/20";
      default: return "bg-apex-warning text-white border-apex-warning/20";
    }
  };

  // --- PRINT LOGIC ---
  const [jobToPrint, setJobToPrint] = useState<any>(null);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => setJobToPrint(null) 
  });

  const triggerPrint = (job: any) => {
    setJobToPrint(job);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const [invoiceToPrint, setInvoiceToPrint] = useState<any>(null);
  const [billingJob, setBillingJob] = useState<any>(null); 
  const [costs, setCosts] = useState({ parts: 0, labor: 0 });

  const invoiceRef = useRef(null);

  const handlePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
    onAfterPrint: () => setInvoiceToPrint(null)
  });

  const openBilling = (job: any) => {
    setBillingJob(job);
    setCosts({
      parts: Number(job.parts_cost) || 0,
      labor: Number(job.labor_cost) || 0
    });
  };

  const saveBillingAndPrint = async () => {
    if (!billingJob) return;
    try {
      const res = await axios.patch(`http://localhost:8000/api/service/records/${billingJob.id}/`, {
        parts_cost: costs.parts,
        labor_cost: costs.labor,
        status: 'COMPLETED' 
      });

      const updatedJob = res.data;
      setBillingJob(null);
      fetchActiveJobs();

      setInvoiceToPrint(updatedJob);
      setTimeout(() => {
        handlePrintInvoice();
      }, 100);

    } catch (error) {
      alert("Failed to save billing info.");
    }
  };

  // Shared Dark Input Class
  const inputClass = "bg-apex-black border-apex-border text-white placeholder:text-gray-600 focus:border-apex-red focus:ring-1 focus:ring-apex-red";

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">

      {/* --- TOP SECTION: SCANNER & RESULTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT COLUMN: SCANNER & INPUT */}
        <div className="space-y-6">
          <Card className="shadow-lg border border-apex-border bg-apex-surface">
            <CardHeader className="bg-apex-blue border-b border-apex-border rounded-t-xl py-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <Camera className="w-5 h-5 text-apex-red" /> AI Service Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div
                className="border-2 border-dashed border-apex-border rounded-xl h-48 flex flex-col items-center justify-center bg-apex-black hover:bg-apex-black/80 cursor-pointer transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                ) : (
                  <div className="text-center text-apex-muted group-hover:text-white transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-apex-red" />
                    <p className="font-bold">UPLOAD VEHICLE PHOTO</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
              </div>
              <Button onClick={handleScan} disabled={loading || !selectedImage} className="w-full bg-apex-info hover:bg-blue-600 text-white font-bold h-12">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SCANNING...</> : "SCAN IMAGE"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-apex-border bg-apex-surface">
            <CardContent className="p-4">
              <Label className="text-xs font-bold text-apex-muted uppercase tracking-wider">Or Enter Manually</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="e.g. PU2338F"
                  value={manualPlate}
                  onChange={(e) => setManualPlate(e.target.value)}
                  className={`${inputClass} uppercase font-mono tracking-wider`}
                />
                <Button className="bg-apex-gray hover:bg-apex-border text-white border border-apex-border" onClick={handleManualSearch} disabled={!manualPlate}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="space-y-6">

          {/* SCENARIO A: EXISTING CUSTOMER */}
          {existingVehicle && (
            <Card className="border border-apex-success/30 shadow-md bg-apex-surface">
              <CardHeader className="bg-apex-success/10 border-b border-apex-success/20 py-4">
                <CardTitle className="text-apex-success flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Vehicle Found
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-apex-muted">Vehicle</Label>
                    <p className="font-bold text-lg text-white">{existingVehicle.year} {existingVehicle.make} {existingVehicle.model}</p>
                  </div>
                  <div>
                    <Label className="text-apex-muted">Plate</Label>
                    <p className="font-mono bg-apex-black border border-apex-border inline-block px-3 py-1 rounded text-white tracking-widest">{existingVehicle.license_plate}</p>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3 text-apex-silver font-bold uppercase text-xs tracking-wider">
                    <History className="w-4 h-4 text-apex-info" /> Recent History
                  </Label>
                  <div className="bg-apex-black rounded-md p-3 space-y-2 max-h-40 overflow-y-auto border border-apex-border">
                    {existingVehicle.history.length === 0 ? (
                      <p className="text-sm text-apex-muted italic">No previous records.</p>
                    ) : (
                      existingVehicle.history.map((rec) => (
                        <div key={rec.id} className="flex justify-between text-sm border-b border-apex-border/50 last:border-0 pb-2">
                          <span className="text-white">{rec.description}</span>
                          <span className="text-apex-muted text-xs">{rec.date}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-apex-border">
                  <Label className="text-white font-semibold mb-2 block">Create Service Ticket</Label>
                  <div className="flex gap-2">
                    <Input 
                        placeholder="e.g. Oil Change & Tire Rotation" 
                        value={newJob} 
                        onChange={(e) => setNewJob(e.target.value)} 
                        className={inputClass}
                    />
                    <Button onClick={handleCreateJob} className="bg-apex-success hover:bg-green-600 text-white font-bold whitespace-nowrap">Create Job</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SCENARIO B: NEW CUSTOMER */}
          {isNewCustomer && (
            <Card className="border border-apex-info/30 shadow-md bg-apex-surface">
              <CardHeader className="bg-apex-info/10 border-b border-apex-info/20 py-4">
                <CardTitle className="text-apex-info flex items-center gap-2">
                  <User className="w-5 h-5" /> Register New Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-apex-muted">Plate <strong className="text-white font-mono">{detectedPlate}</strong> not found in database.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-apex-muted">Name</Label><Input className={inputClass} value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label className="text-apex-muted">Phone</Label><Input className={inputClass} value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} /></div>
                  <div className="space-y-2"><Label className="text-apex-muted">Make</Label><Input className={inputClass} value={newCustomer.make} onChange={(e) => setNewCustomer({ ...newCustomer, make: e.target.value })} /></div>
                  <div className="space-y-2"><Label className="text-apex-muted">Model</Label><Input className={inputClass} value={newCustomer.model} onChange={(e) => setNewCustomer({ ...newCustomer, model: e.target.value })} /></div>
                </div>
                <Button className="w-full bg-apex-info hover:bg-blue-600 text-white font-bold" onClick={handleRegister}>
                  <Save className="w-4 h-4 mr-2" /> Complete Registration
                </Button>
              </CardContent>
            </Card>
          )}

          {/* SCENARIO C: WAITING */}
          {!existingVehicle && !isNewCustomer && (
            <div className="h-full flex flex-col items-center justify-center text-apex-muted/30 border-2 border-dashed border-apex-border rounded-xl p-12 bg-apex-black/20">
              <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
              <p className="font-bold tracking-wider">SCAN OR SEARCH TO BEGIN</p>
            </div>
          )}

        </div>
      </div>

      {/* --- BOTTOM SECTION: ACTIVE SERVICE QUEUE --- */}
      <Card className="shadow-lg border border-apex-border bg-apex-surface">
        <CardHeader className="bg-apex-black border-b border-apex-border py-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5 text-apex-warning" /> Active Service Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-apex-black scrollbar-thumb-apex-gray">
            
            {activeJobs.length === 0 ? (
              <div className="p-12 text-center text-apex-muted italic">No active jobs. The lane is clear! </div>
            ) : (
              <>
                {/* --- DESKTOP VIEW (Table) --- */}
                <div className="hidden md:block">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-apex-black text-apex-silver font-bold uppercase text-xs tracking-wider border-b border-apex-border">
                      <tr>
                        <th className="p-4">Vehicle</th>
                        <th className="p-4">Service Description</th>
                        <th className="p-4">Date In</th>
                        <th className="p-4">Status Action</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-apex-border/50">
                      {activeJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-apex-black/50 transition-colors group">
                          <td className="p-4">
                            <div className="font-black text-white text-base">{job.vehicle_details?.license_plate || "UNKNOWN"}</div>
                            <div className="text-xs text-apex-muted">{job.vehicle_details?.make} {job.vehicle_details?.model}</div>
                          </td>
                          <td className="p-4 text-white font-medium">
                            {job.description}
                          </td>
                          <td className="p-4 text-apex-muted">
                            {new Date(job.date).toLocaleDateString()}
                            <span className="text-xs ml-1 opacity-50 block">{new Date(job.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="p-4">
                            <div className="relative w-fit">
                              <select
                                className={`appearance-none rounded-full pl-3 pr-8 py-1 text-xs font-bold cursor-pointer border border-transparent focus:outline-none focus:ring-1 focus:ring-white/20 transition-all ${getStatusColor(job.status)}`}
                                value={job.status}
                                onChange={(e) => handleStatusChange(job.id, e.target.value)}
                              >
                                <option className="bg-apex-black text-white" value="PENDING">Pending</option>
                                <option className="bg-apex-black text-white" value="IN_PROGRESS">In Progress</option>
                                <option className="bg-apex-black text-white" value="COMPLETED">Completed</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none opacity-80">
                                <ChevronDown className="h-3 w-3" />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-apex-muted hover:text-white hover:bg-apex-gray"
                              onClick={() => triggerPrint(job)}
                              title="Print Job Card"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-apex-success hover:text-white hover:bg-apex-success"
                              onClick={() => openBilling(job)}
                              title="Generate Invoice"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* --- MOBILE VIEW (Cards) --- */}
                <div className="md:hidden space-y-4 p-4">
                  {activeJobs.map((job) => (
                    <div key={job.id} className="bg-apex-black border border-apex-border rounded-xl p-4 shadow-lg flex flex-col gap-3">
                      
                      {/* Header */}
                      <div className="flex justify-between items-start border-b border-apex-border/50 pb-2">
                        <div>
                          <h3 className="font-black text-white text-lg">{job.vehicle_details?.license_plate || "UNKNOWN"}</h3>
                          <p className="text-xs text-apex-muted uppercase">{job.vehicle_details?.make} {job.vehicle_details?.model}</p>
                        </div>
                        <div className="flex gap-1">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-apex-muted hover:text-white" onClick={() => triggerPrint(job)}>
                              <Printer className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-apex-success" onClick={() => openBilling(job)}>
                              <DollarSign className="w-4 h-4" />
                           </Button>
                        </div>
                      </div>

                      {/* Body */}
                      <div>
                        <p className="text-sm font-medium text-white">{job.description}</p>
                        <p className="text-xs text-apex-muted mt-1 flex items-center gap-1">
                           <CalendarIcon className="h-3 w-3" />
                           {new Date(job.date).toLocaleDateString()} at {new Date(job.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Status Dropdown - Mobile */}
                      <div className="pt-2">
                        <div className="relative w-full">
                          <select
                            className={`w-full appearance-none rounded-lg px-4 py-2 pr-10 text-sm font-bold cursor-pointer border border-transparent focus:outline-none focus:ring-1 focus:ring-white/20 transition-all ${getStatusColor(job.status)}`}
                            value={job.status}
                            onChange={(e) => handleStatusChange(job.id, e.target.value)}
                          >
                            <option className="bg-apex-black text-white" value="PENDING">Status: Pending</option>
                            <option className="bg-apex-black text-white" value="IN_PROGRESS">Status: In Progress</option>
                            <option className="bg-apex-black text-white" value="COMPLETED">Status: Completed</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none opacity-80">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="hidden">
        <PrintableJobCard ref={printRef} job={jobToPrint} />
      </div>

      {/* BILLING DIALOG - Dark Theme (Responsive Width) */}
      {billingJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm md:max-w-md shadow-2xl bg-apex-surface border border-apex-border">
            <CardHeader className="bg-apex-black border-b border-apex-border py-4 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="w-5 h-5 text-apex-success" /> Generate Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <p className="text-sm text-apex-muted">Enter final costs for <strong className="text-white">{billingJob.vehicle_details?.license_plate}</strong>.</p>

              <div className="space-y-2">
                <Label className="text-apex-muted">Parts Cost ($)</Label>
                <Input
                  type="number"
                  value={costs.parts}
                  className={inputClass}
                  onChange={(e) => setCosts({ ...costs, parts: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-apex-muted">Labor Cost ($)</Label>
                <Input
                  type="number"
                  value={costs.labor}
                  className={inputClass}
                  onChange={(e) => setCosts({ ...costs, labor: parseFloat(e.target.value) })}
                />
              </div>

              <div className="pt-4 flex justify-between font-bold text-lg border-t border-apex-border text-white">
                <span>Total:</span>
                <span className="text-apex-success">${(costs.parts + costs.labor).toFixed(2)}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-apex-border text-apex-muted hover:bg-apex-black hover:text-white" onClick={() => setBillingJob(null)}>Cancel</Button>
                <Button className="flex-1 bg-apex-success hover:bg-green-600 text-white font-bold" onClick={saveBillingAndPrint}>
                  Print Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* HIDDEN INVOICE COMPONENT */}
      <div className="hidden">
        <PrintableInvoice ref={invoiceRef} job={invoiceToPrint} />
      </div>

    </div>
  );
};