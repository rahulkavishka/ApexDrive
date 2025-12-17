import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Phone, CarFront, Search, Trash2, ChevronDown, DollarSign } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import api from "@/lib/api";

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  quoted_price: string;
  monthly_payment: string;
  created_at: string;
  vehicle?: number;
  vehicle_details?: {
    year: number;
    make: string;
    model: string;
    stock_number: string;
  };
}

export const LeadsList = () => {
  const { isManager } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.get("api/sales/leads/");
      setLeads(res.data);
    } catch (error) {
      console.error("Error fetching leads", error);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE FUNCTION ---
  const handleDelete = async (id: number) => {
    const leadToDelete = leads.find(l => l.id === id);
    if (!window.confirm("Are you sure? If this lead is in negotiation, the vehicle will be released.")) return;

    try {
      if (leadToDelete?.status === 'NEGOTIATION' && leadToDelete.vehicle) {
        await api.patch(`api/inventory/vehicles/${leadToDelete.vehicle}/`, {
          status: 'AVAILABLE'
        });
      }

      await api.delete(`api/sales/leads/${id}/`);
      setLeads(leads.filter(lead => lead.id !== id));

    } catch (error) {
      alert("Failed to delete lead");
    }
  };

  // --- UPDATE STATUS FUNCTION ---
  const handleStatusChange = async (id: number, newStatus: string) => {
    const leadToUpdate = leads.find(l => l.id === id);

    try {
      setLeads(leads.map(lead =>
        lead.id === id ? { ...lead, status: newStatus } : lead
      ));

      await api.patch(`api/sales/leads/${id}/`, { status: newStatus });

      if (leadToUpdate?.vehicle) {
        if (newStatus === 'LOST') {
          await api.patch(`api/inventory/vehicles/${leadToUpdate.vehicle}/`, {
            status: 'AVAILABLE'
          });
          alert("Lead marked LOST. Vehicle is now AVAILABLE.");
        }
        else if (newStatus === 'SOLD') {
          await api.patch(`api/inventory/vehicles/${leadToUpdate.vehicle}/`, {
            status: 'SOLD'
          });
          alert("Congratulations! Vehicle marked as SOLD.");
        }
      }

    } catch (error) {
      console.error("Failed to update status");
      fetchLeads();
    }
  };

  // --- FILTERING LOGIC ---
  const filteredLeads = leads.filter(lead => {
    const searchString = `${lead.first_name} ${lead.last_name} ${lead.phone} ${lead.vehicle_details?.model || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SOLD': return "bg-apex-success text-white border-apex-success/20";
      case 'WON': return "bg-apex-success text-white border-apex-success/20";
      case 'LOST': return "bg-apex-error text-white border-apex-error/20";
      case 'NEGOTIATION': return "bg-apex-info text-white border-apex-info/20";
      default: return "bg-apex-gray text-apex-silver border-apex-border";
    }
  };

  return (
    <Card className="shadow-2xl border border-apex-border bg-apex-surface">
      <CardHeader className="bg-apex-blue border-b border-apex-border rounded-t-xl py-4 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="flex items-center gap-2 text-white font-bold tracking-wide text-lg md:text-xl">
            <Users className="h-5 w-5 md:h-6 md:w-6 text-apex-red" />
            ACTIVE LEADS
            <Badge variant="secondary" className="ml-2 bg-apex-black text-apex-silver border border-apex-border text-xs">
              {filteredLeads.length}
            </Badge>
          </CardTitle>

          {/* TOOLBAR - Stacks on mobile */}
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-apex-muted" />
              <Input
                placeholder="Search leads..."
                className="pl-10 bg-apex-black border-apex-border text-white placeholder:text-gray-500 focus:ring-apex-red focus:border-transparent h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative w-full md:w-48">
              <select
                className="h-10 w-full appearance-none rounded-md border border-apex-border bg-apex-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-apex-red pr-8 cursor-pointer transition-shadow"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New Lead</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="SOLD">Sold</option>
                <option value="LOST">Lost</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-apex-muted">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 bg-apex-surface rounded-b-xl">
        {loading ? (
          <div className="p-12 text-center text-apex-muted animate-pulse">Loading Leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-apex-muted italic">No active leads found.</div>
        ) : (
          <>
            {/* DESKTOP TABLE (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-apex-black border-b border-apex-border hover:bg-apex-black">
                    <TableHead className="text-apex-silver font-bold uppercase tracking-wider text-xs">Customer</TableHead>
                    <TableHead className="text-apex-silver font-bold uppercase tracking-wider text-xs">Vehicle Interest</TableHead>
                    <TableHead className="text-apex-silver font-bold uppercase tracking-wider text-xs">Quote Details</TableHead>
                    <TableHead className="text-apex-silver font-bold uppercase tracking-wider text-xs">Status</TableHead>
                    {isManager && <TableHead className="text-right text-apex-silver font-bold uppercase tracking-wider text-xs">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-apex-black/50 border-b border-apex-border/50 transition-colors group">
                      <TableCell>
                        <div className="font-bold text-white text-base">{lead.first_name} {lead.last_name}</div>
                        <div className="flex items-center text-xs text-apex-muted mt-1 group-hover:text-apex-silver">
                          <Phone className="w-3 h-3 mr-1" /> {lead.phone}
                        </div>
                      </TableCell>

                      <TableCell>
                        {lead.vehicle_details ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-apex-black rounded border border-apex-border">
                              <CarFront className="w-4 h-4 text-apex-red" />
                            </div>
                            <div>
                              <span className="text-white font-medium block">
                                {lead.vehicle_details.year} {lead.vehicle_details.make} {lead.vehicle_details.model}
                              </span>
                              <span className="text-xs text-apex-muted font-mono">STK: {lead.vehicle_details.stock_number}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-apex-muted italic text-xs">No vehicle selected</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="font-black text-apex-success text-base">${lead.monthly_payment}/mo</div>
                        <div className="text-xs text-apex-muted">Quote: ${lead.quoted_price}</div>
                      </TableCell>

                      <TableCell>
                        <div className="relative w-fit">
                          <select
                            className={`appearance-none rounded px-3 py-1 pr-8 text-xs font-bold tracking-wide outline-none cursor-pointer border border-transparent transition-all ${getStatusColor(lead.status)}`}
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          >
                            <option className="bg-apex-black text-white" value="NEW">New</option>
                            <option className="bg-apex-black text-white" value="NEGOTIATION">Negotiation</option>
                            <option className="bg-apex-black text-white" value="SOLD">Sold</option>
                            <option className="bg-apex-black text-white" value="LOST">Lost</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-white/70">
                            <ChevronDown className="h-3 w-3" />
                          </div>
                        </div>
                      </TableCell>

                      {isManager && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-apex-muted hover:text-red-500 hover:bg-red-900/20"
                            onClick={() => handleDelete(lead.id)}
                            title="Delete Lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE CARD VIEW (Visible only on Mobile) */}
            <div className="md:hidden space-y-3 p-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="bg-apex-black border border-apex-border rounded-xl p-4 space-y-3 shadow-lg">
                  {/* Header: Name & Phone */}
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-white text-lg">{lead.first_name} {lead.last_name}</h3>
                        <p className="text-sm text-apex-muted flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" /> {lead.phone}
                        </p>
                    </div>
                    {isManager && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-apex-muted hover:text-red-500 -mt-2 -mr-2"
                            onClick={() => handleDelete(lead.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>

                  {/* Vehicle Info */}
                  <div className="bg-apex-surface rounded-lg p-3 border border-apex-border/50 flex items-center gap-3">
                     <div className="p-2 bg-apex-black rounded-full border border-apex-border shrink-0">
                        <CarFront className="h-5 w-5 text-apex-red" />
                     </div>
                     <div className="min-w-0">
                        {lead.vehicle_details ? (
                            <>
                                <p className="font-bold text-white text-sm truncate">
                                    {lead.vehicle_details.year} {lead.vehicle_details.make} {lead.vehicle_details.model}
                                </p>
                                <p className="text-xs text-apex-muted font-mono">Stock: {lead.vehicle_details.stock_number}</p>
                            </>
                        ) : (
                            <p className="text-apex-muted italic text-xs">No vehicle selected</p>
                        )}
                     </div>
                  </div>

                  {/* Financials & Status */}
                  <div className="flex justify-between items-center pt-2 border-t border-apex-border/50">
                     <div>
                        <p className="text-[10px] text-apex-silver uppercase tracking-wider font-bold">Monthly</p>
                        <p className="text-xl font-black text-apex-success">${lead.monthly_payment}</p>
                     </div>
                     
                     {/* Mobile Status Dropdown */}
                     <div className="relative">
                        <select
                            className={`appearance-none rounded-lg px-3 py-2 pr-8 text-xs font-bold tracking-wide outline-none cursor-pointer border border-transparent transition-all ${getStatusColor(lead.status)}`}
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        >
                            <option className="bg-apex-black text-white" value="NEW">New</option>
                            <option className="bg-apex-black text-white" value="NEGOTIATION">Negot.</option>
                            <option className="bg-apex-black text-white" value="SOLD">Sold</option>
                            <option className="bg-apex-black text-white" value="LOST">Lost</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-white/70">
                            <ChevronDown className="h-3 w-3" />
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};