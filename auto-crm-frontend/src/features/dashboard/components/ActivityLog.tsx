import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Users, Calendar as CalendarIcon, Filter, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

// Define Types
type ActivityType = 'LEAD' | 'SERVICE' | 'APPOINTMENT';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  date: string; // ISO String
  status: string;
}

export const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL'); 
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllActivity();
  }, []);

  const fetchAllActivity = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Token ${token}` } };

      const [leadsRes, serviceRes, apptRes] = await Promise.all([
        axios.get("http://localhost:8000/api/sales/leads/", config),
        axios.get("http://localhost:8000/api/service/records/", config),
        axios.get("http://localhost:8000/api/service/appointments/", config)
      ]);

      // 1. Process Leads
      const leads = leadsRes.data.map((l: any) => ({
        id: `lead-${l.id}`,
        type: 'LEAD',
        title: `New Lead: ${l.first_name} ${l.last_name}`,
        subtitle: `Vehicle Interest: ${l.vehicle_details?.model || 'Unknown'}`,
        date: l.created_at,
        status: l.status
      }));

      // 2. Process Service Jobs
      const services = serviceRes.data.map((s: any) => ({
        id: `svc-${s.id}`,
        type: 'SERVICE',
        title: `Service Job: ${s.description}`,
        subtitle: `Plate: ${s.vehicle_details?.license_plate || 'N/A'}`,
        date: s.date,
        status: s.status
      }));

      // 3. Process Appointments
      const appointments = apptRes.data.map((a: any) => ({
        id: `appt-${a.id}`,
        type: 'APPOINTMENT',
        title: `Appointment: ${a.title}`,
        subtitle: `Scheduled for Customer #${a.customer}`,
        date: a.start_time,
        status: a.status
      }));

      // 4. Combine & SORT (Newest Date First)
      const combined = [...leads, ...services, ...appointments].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setActivities(combined);
    } catch (error) {
      console.error("Error loading activity", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERING LOGIC ---
  const filteredActivities = activities.filter(item => {
    const matchesType = 
        filter === 'ALL' ? true : 
        filter === 'LEAD' ? item.type === 'LEAD' :
        filter === 'SERVICE' ? item.type === 'SERVICE' :
        filter === 'APPOINTMENT' ? item.type === 'APPOINTMENT' : true;

    const searchLower = search.toLowerCase();
    const matchesSearch = 
        item.title.toLowerCase().includes(searchLower) || 
        item.subtitle.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower);

    return matchesType && matchesSearch;
  });

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'LEAD': return <Users className="h-5 w-5 text-apex-info" />;
      case 'SERVICE': return <Wrench className="h-5 w-5 text-apex-warning" />;
      case 'APPOINTMENT': return <CalendarIcon className="h-5 w-5 text-purple-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (['COMPLETED', 'SOLD', 'WON'].includes(status)) return "bg-apex-success/20 text-apex-success border-apex-success/30"; 
    if (['PENDING', 'SCHEDULED', 'NEW', 'IN_PROGRESS'].includes(status)) return "bg-apex-info/20 text-apex-info border-apex-info/30";
    return "bg-apex-gray text-apex-silver border-apex-border";
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Activity Log</h1>
           <p className="text-sm md:text-base text-apex-muted mt-1">Real-time system events</p>
        </div>
      </div>

      {/* HEADER & FILTERS - Dark Theme */}
      <Card className="bg-apex-surface border border-apex-border shadow-xl">
        <CardHeader className="border-b border-apex-border bg-apex-blue/10 rounded-t-xl py-4 px-4 md:px-6">
            <div className="flex flex-col gap-4">
                {/* Title */}
                <CardTitle className="flex items-center gap-2 text-white font-bold tracking-wide text-base md:text-lg">
                    <Filter className="h-5 w-5 text-apex-red"/> SYSTEM ACTIVITY LOG
                </CardTitle>
                
                {/* Controls Container - Stacks vertically on mobile */}
                <div className="flex flex-col md:flex-row gap-3 w-full">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-apex-muted" />
                        <Input 
                            placeholder="Search logs..." 
                            className="pl-10 bg-apex-black border-apex-border text-white placeholder:text-gray-500 focus:border-apex-red focus:ring-1 focus:ring-apex-red h-10 text-sm w-full" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    {/* Filter Dropdown */}
                    <div className="relative w-full md:w-48">
                        <select 
                            className="w-full h-10 appearance-none rounded-md border border-apex-border bg-apex-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-apex-red cursor-pointer transition-shadow truncate pr-8"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Events</option>
                            <option value="APPOINTMENT">Appointments</option>
                            <option value="LEAD">Sales Leads</option>
                            <option value="SERVICE">Service Jobs</option>
                        </select>
                        {/* Custom Arrow Icon */}
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-apex-muted">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </CardHeader>

        {/* ACTIVITY LIST */}
        <CardContent className="p-0 bg-apex-surface rounded-b-xl">
            {loading ? (
                <div className="p-12 text-center text-apex-muted animate-pulse">Loading activities...</div>
            ) : filteredActivities.length === 0 ? (
                <div className="p-12 text-center text-apex-muted italic border-dashed border-t border-apex-border">No matching records found.</div>
            ) : (
                <div className="divide-y divide-apex-border/50">
                    {filteredActivities.map((item) => (
                        <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 hover:bg-apex-black/50 transition-colors group">
                            
                            {/* Top Row on Mobile: Icon + Title */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 md:p-3 bg-apex-black rounded-full border border-apex-border shadow-inner shrink-0 group-hover:border-apex-gray transition-colors">
                                    {getIcon(item.type)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-white text-sm md:text-base truncate group-hover:text-apex-red transition-colors">{item.title}</p>
                                    <p className="text-xs md:text-sm text-apex-muted truncate">{item.subtitle}</p>
                                </div>
                            </div>
                            
                            {/* Bottom Row on Mobile: Status + Date */}
                            <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end pl-12 md:pl-0 shrink-0 gap-2">
                                <Badge className={`border text-[10px] md:text-xs px-2 py-0.5 ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </Badge>
                                <p className="text-[10px] md:text-xs text-apex-muted font-medium flex items-center gap-1 bg-apex-black px-2 py-1 rounded border border-apex-border/30">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span className="hidden md:inline">{new Date(item.date).toLocaleDateString()}</span>
                                    {/* Mobile Date Format (Dec 17) */}
                                    <span className="md:hidden">{new Date(item.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                    <span className="opacity-50 mx-1">at</span> 
                                    {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};