import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, Wrench, TrendingUp, Activity, Calendar as CalendarIcon, Settings, Briefcase } from "lucide-react";
import { RevenueChart } from './RevenueChart';
import { LeadSourceChart } from './LeadSourceChart';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    activeLeads: 0,
    serviceJobs: 0,
    inventoryValue: 0
  });

  const [analytics, setAnalytics] = useState({
    revenue: [],
    sources: []
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Token ${token}` } };

      // Define the base URL from environment variables
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const [carsRes, leadsRes, serviceRes, apptRes, analyticsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/inventory/vehicles/`, config),
        axios.get(`${API_BASE_URL}/api/sales/leads/`, config),
        axios.get(`${API_BASE_URL}/api/service/records/`, config),
        axios.get(`${API_BASE_URL}/api/service/appointments/`, config),
        axios.get(`${API_BASE_URL}/api/analytics/`, config),
        axios.get(`${API_BASE_URL}/api/dashboard/stats/`, config)
      ]);

      const cars = carsRes.data;
      const leads = leadsRes.data;
      const services = serviceRes.data;
      const backendStats = statsRes.data.stats;

      const stockCount = cars.filter((c: any) => c.status === 'AVAILABLE' || c.status === 'RESERVED').length;

      setStats({
        totalCars: stockCount,
        activeLeads: leads.filter((l: any) => l.status !== 'SOLD' && l.status !== 'LOST').length,
        serviceJobs: services.length,
        inventoryValue: backendStats.inventory_value
      });

      setAnalytics({
        revenue: analyticsRes.data.revenue_chart,
        sources: analyticsRes.data.lead_sources
      });

      // Activity Logic
      const recentLeads = leads.map((l: any) => ({
        id: `lead-${l.id}`,
        type: 'LEAD',
        text: `New Lead: ${l.first_name} ${l.last_name} interested in ${l.vehicle_details?.model || 'Vehicle'}`,
        date: l.created_at,
        icon: <Users className="h-4 w-4 text-apex-info" />
      }));

      const recentServices = services.map((s: any) => ({
        id: `svc-${s.id}`,
        type: 'SERVICE',
        text: `Service Job: ${s.description}`,
        date: s.date,
        icon: <Wrench className="h-4 w-4 text-apex-warning" />
      }));

      const recentAppts = apptRes.data.map((a: any) => ({
        id: `appt-${a.id}`,
        type: 'APPOINTMENT',
        text: `Scheduled: ${a.title} (Cust #${a.customer})`,
        date: a.start_time,
        icon: <CalendarIcon className="h-4 w-4 text-apex-success" />
      }));

      const combined = [...recentLeads, ...recentServices, ...recentAppts]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setRecentActivity(combined);

    } catch (error) {
      console.error("Dashboard load failed", error);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-0">
      {/* Main Title - Ensuring it is white against the main background */}
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Overview</h1>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Inventory Count"
          value={stats.totalCars}
          icon={<Car className="h-6 w-6 text-apex-info" />}
          subtext="Vehicles in stock"
        />
        <StatsCard
          title="Active Leads"
          value={stats.activeLeads}
          icon={<Users className="h-6 w-6 text-apex-success" />}
          subtext="Potential buyers"
        />
        <StatsCard
          title="Service Jobs"
          value={stats.serviceJobs}
          icon={<Wrench className="h-6 w-6 text-apex-warning" />}
          subtext="Total tickets"
        />
        <StatsCard
          title="Inventory Value"
          value={`$${(stats.inventoryValue / 1000).toFixed(1)}k`}
          icon={<Briefcase className="h-6 w-6 text-apex-red" />}
          subtext="Asset Cost (Avail + Rsrvd)"
        />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={analytics.revenue} />
        </div>
        <div>
          <LeadSourceChart data={analytics.sources} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* RECENT ACTIVITY - EXPLICIT DARK BACKGROUND */}
        <Card className="bg-apex-surface border-apex-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-apex-border pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-apex-red" /> Recent Activity
            </CardTitle>
            <Link to="/activity" className="text-sm text-apex-muted hover:text-white hover:underline transition-colors">
              View All
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-apex-muted text-sm italic">No recent activity.</p>
              ) : (
                recentActivity.map((item) => (
                  // Ensure list items have contrast against the dark card
                  <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-apex-border/50 last:border-0 last:pb-0 group hover:bg-apex-black/20 rounded p-2 transition-colors">
                    <div className="p-2 bg-apex-black rounded-full border border-apex-border group-hover:border-apex-gray">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.text}</p>
                      <p className="text-xs text-apex-muted">
                        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS - REMAINING DARK (Apex Gray) */}
        <Card className="bg-apex-gray border-apex-gray shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-apex-silver text-sm mb-4">Jump straight to key tasks.</p>
            <QuickActionLink to="/inventory" icon={<Car />} label="Stock In New Car" />
            <QuickActionLink to="/sales" icon={<TrendingUp />} label="Calculate Deal" />
            <QuickActionLink to="/service" icon={<Wrench />} label="Scan Service Plate" />
            <QuickActionLink to="/calendar" icon={<CalendarIcon />} label="Book Appointment" />
            <QuickActionLink to="/activity" icon={<Settings />} label="View Activity Log" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper Sub-Component - EXPLICIT DARK BACKGROUND
const StatsCard = ({ title, value, icon, subtext }: any) => (
  // Explicitly setting bg-apex-surface to ensure dark background
  <Card className="bg-apex-surface border-apex-border">
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        {/* Explicit light text colors */}
        <p className="text-sm font-bold text-apex-muted uppercase tracking-wider">{title}</p>
        <h2 className="text-3xl font-black text-white mt-1">{value}</h2>
        <p className="text-xs text-apex-silver mt-1">{subtext}</p>
      </div>
      {/* Icon container background darker than the card */}
      <div className="p-3 bg-apex-black rounded-full border border-apex-border shadow-inner">{icon}</div>
    </CardContent>
  </Card>
);

// Quick Action Link Helper
const QuickActionLink = ({ to, icon, label }: any) => (
  <Link to={to} className="block p-3 bg-apex-black/50 hover:bg-apex-red hover:text-white rounded-lg transition flex justify-between items-center group border border-transparent hover:border-apex-red/50">
    <span className="text-white font-medium">{label}</span>
    {/* Ensure icon gets correct colors on hover */}
    <div className="text-apex-silver group-hover:text-white transition-colors">
      {icon}
    </div>
  </Link>
);