import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays, subDays, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, User, Save, Trash2, ChevronLeft, ChevronRight, ChevronDown, Loader2, CalendarDays } from 'lucide-react';

// --- TYPES ---
interface Appointment {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  customer: number;
  status: string;
}

export const ServiceCalendar = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // --- VIEW STATE ---
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00'
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8000/api/service/appointments/');
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleSave = async () => {
    if (!formData.title || !formData.customer || !formData.date || !formData.time) {
      return alert("Please fill in all fields.");
    }

    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); 

      const payload = {
        title: formData.title,
        customer: formData.customer,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'SCHEDULED'
      };

      await axios.post('http://localhost:8000/api/service/appointments/', payload);
      
      setFormData({ ...formData, title: '', customer: '' });
      fetchAppointments();
      alert("Appointment Booked!");

    } catch (error) {
      alert("Failed to book appointment.");
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setAppointments(prev => prev.map(appt => 
        appt.id === id ? { ...appt, status: newStatus } : appt
      ));
      await axios.patch(`http://localhost:8000/api/service/appointments/${id}/`, { status: newStatus });
    } catch (error) {
      fetchAppointments(); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/service/appointments/${id}/`);
      setAppointments(prev => prev.filter(appt => appt.id !== id));
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  // --- NAVIGATION ---
  const handleNavigate = (direction: 'back' | 'next') => {
    if (view === 'day') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 7) : subDays(prev, 7));
    } else {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  // --- FILTER ---
  const filteredAppointments = appointments.filter(appt => {
    const apptDate = new Date(appt.start_time);
    
    if (view === 'day') return isSameDay(apptDate, currentDate);
    if (view === 'week') return isWithinInterval(apptDate, { start: startOfWeek(currentDate), end: endOfWeek(currentDate) });
    if (view === 'month') return isWithinInterval(apptDate, { start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
    return false;
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // --- STYLES ---
  // The magic classes:
  // 1. opacity-0 on the indicator makes the native icon invisible
  // 2. absolute/right-0 stretches the invisible indicator over our custom icon
  // 3. cursor-pointer ensures the user knows it's clickable
  const dateInputClass = "bg-apex-black border-apex-border text-white placeholder:text-gray-600 focus:border-apex-red focus:ring-1 focus:ring-apex-red [color-scheme:dark] pr-10 h-11 relative [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:bottom-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer";
  
  const getStatusColor = (status: string) => {
    switch (status) {
        case 'COMPLETED': return "bg-apex-success/20 text-apex-success border-apex-success/30";
        case 'CANCELLED': return "bg-apex-error/20 text-apex-error border-apex-error/30";
        default: return "bg-apex-info/20 text-apex-info border-apex-info/30";
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Service Schedule</h1>
        <p className="text-apex-muted text-sm mt-1">Book and manage service appointments</p>
      </div>

      {/* --- 1. BOOKING FORM --- */}
      <Card className="bg-apex-surface border-apex-border shadow-lg">
        <CardHeader className="bg-apex-blue/20 border-b border-apex-border py-4 rounded-t-xl px-4 md:px-6">
            <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                <Clock className="w-5 h-5 text-apex-red" /> Book New Appointment
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                {/* Title */}
                <div className="md:col-span-2 space-y-2">
                    <Label className="text-apex-muted text-xs uppercase font-bold">Service Title</Label>
                    <Input 
                        placeholder="e.g. 50k Mile Service" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="bg-apex-black border-apex-border text-white placeholder:text-gray-600 focus:border-apex-red focus:ring-1 focus:ring-apex-red h-11"
                    />
                </div>
                
                {/* Customer */}
                <div className="space-y-2">
                    <Label className="text-apex-muted text-xs uppercase font-bold">Customer ID</Label>
                    <Input 
                        placeholder="ID#" 
                        value={formData.customer}
                        onChange={(e) => setFormData({...formData, customer: e.target.value})}
                        className="bg-apex-black border-apex-border text-white placeholder:text-gray-600 focus:border-apex-red focus:ring-1 focus:ring-apex-red h-11"
                    />
                </div>
                
                {/* Date with Custom Icon on Right */}
                <div className="space-y-2">
                    <Label className="text-apex-muted text-xs uppercase font-bold">Date</Label>
                    <div className="relative">
                        <Input 
                            type="date" 
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            className={dateInputClass}
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-apex-red pointer-events-none" />
                    </div>
                </div>

                {/* Time with Custom Icon on Right */}
                <div className="space-y-2">
                    <Label className="text-apex-muted text-xs uppercase font-bold">Time</Label>
                    <div className="relative">
                        <Input 
                            type="time" 
                            value={formData.time}
                            onChange={(e) => setFormData({...formData, time: e.target.value})}
                            className={dateInputClass}
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-apex-red pointer-events-none" />
                    </div>
                </div>
            </div>
            
            <div className="mt-4 flex justify-end">
                <Button onClick={handleSave} className="w-full md:w-auto bg-apex-red hover:bg-red-600 text-white font-bold px-8 h-11 shadow-lg shadow-apex-red/20">
                    <Save className="mr-2 h-4 w-4" /> Schedule
                </Button>
            </div>
        </CardContent>
      </Card>

      {/* --- 2. AGENDA CONTROLS --- */}
      <div className="flex flex-col gap-4 bg-apex-surface/50 p-3 md:p-4 rounded-xl border border-apex-border shadow-md">
          {/* Navigation Row */}
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 md:gap-0">
             
             {/* Navigation Buttons */}
             <div className="flex items-center justify-between w-full md:w-auto gap-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleNavigate('back')} className="bg-apex-black border-apex-border text-white hover:bg-apex-surface hover:text-white h-9 w-9">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="bg-apex-black border-apex-border text-white hover:bg-apex-surface hover:text-white text-xs font-bold uppercase h-9 px-4 tracking-wider">
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleNavigate('next')} className="bg-apex-black border-apex-border text-white hover:bg-apex-surface hover:text-white h-9 w-9">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Mobile Date */}
                  <span className="md:hidden text-white font-bold text-sm">
                      {format(currentDate, view === 'month' ? 'MMM yyyy' : 'MMM d')}
                  </span>
             </div>

             {/* Desktop Date Display */}
             <span className="hidden md:flex text-white font-bold text-lg items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-apex-red" />
                  {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
             </span>

             {/* View Toggles */}
             <div className="flex bg-apex-black rounded-lg p-1 border border-apex-border w-full md:w-auto">
                  {['day', 'week', 'month'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setView(v as any)}
                        className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all duration-200 ${
                            view === v 
                            ? 'bg-apex-blue text-white shadow-md' 
                            : 'text-apex-muted hover:text-white'
                        }`}
                      >
                          {v}
                      </button>
                  ))}
             </div>
          </div>
      </div>

      {/* --- 3. AGENDA LIST --- */}
      <div className="space-y-4">
            {loading ? (
                <div className="py-20 text-center text-apex-muted animate-pulse flex flex-col items-center justify-center bg-apex-surface/30 rounded-xl border border-dashed border-apex-border">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-sm font-medium">Loading Schedule...</p>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="py-20 text-center text-apex-muted italic flex flex-col items-center bg-apex-surface/30 rounded-xl border border-dashed border-apex-border">
                    <CalendarDays className="h-10 w-10 mb-2 opacity-50" />
                    <p>No appointments found for this period.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredAppointments.map((appt) => (
                        <div key={appt.id} className="bg-apex-black border border-apex-border rounded-xl p-4 shadow-lg hover:border-apex-blue/50 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                            
                            {/* Date Block */}
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center justify-center bg-apex-surface border border-apex-border rounded-lg p-3 w-16 h-16 shrink-0 shadow-inner">
                                    <span className="text-[10px] text-apex-red font-black uppercase tracking-widest">{format(new Date(appt.start_time), 'MMM')}</span>
                                    <span className="text-2xl font-black text-white leading-none mt-1">{format(new Date(appt.start_time), 'dd')}</span>
                                </div>
                                
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 text-apex-info mb-1.5">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {format(new Date(appt.start_time), 'h:mm a')} - {format(new Date(appt.end_time), 'h:mm a')}
                                        </span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg leading-tight truncate pr-2">{appt.title}</h3>
                                    <div className="flex items-center gap-2 text-apex-muted text-xs mt-1.5 font-medium">
                                        <User className="h-3 w-3" /> Customer ID: <span className="text-apex-silver font-mono bg-apex-surface px-1.5 rounded border border-apex-border/50">#{appt.customer}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Block */}
                            <div className="flex items-center justify-between md:justify-end gap-3 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-apex-border/30">
                                {/* Status Dropdown */}
                                <div className="relative w-full md:w-48">
                                    <select
                                        className={`w-full appearance-none rounded-lg pl-3 pr-8 py-2 text-xs font-bold cursor-pointer border focus:outline-none focus:ring-1 focus:ring-white/20 transition-all uppercase tracking-wide ${getStatusColor(appt.status)}`}
                                        value={appt.status}
                                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                                    >
                                        <option className="bg-apex-black text-white" value="SCHEDULED">Scheduled</option>
                                        <option className="bg-apex-black text-white" value="COMPLETED">Completed</option>
                                        <option className="bg-apex-black text-white" value="CANCELLED">Cancelled</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none opacity-80">
                                        <ChevronDown className="h-3 w-3" />
                                    </div>
                                </div>

                                {/* Delete */}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-apex-muted hover:text-red-500 hover:bg-red-900/20 shrink-0 h-9 w-9"
                                    onClick={() => handleDelete(appt.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
      </div>
    </div>
  );
};