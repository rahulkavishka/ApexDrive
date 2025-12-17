import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, Briefcase, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Financials = () => {
  const { isManager } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isManager) {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:8000/api/financials/', {
            headers: { Authorization: `Token ${token}` }
        })
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }
  }, [isManager]);

  if (!isManager) {
      return (
          <div className="h-[80vh] flex flex-col items-center justify-center text-apex-muted border-2 border-dashed border-apex-border rounded-xl bg-apex-surface/50 m-4">
              <AlertTriangle className="h-12 w-12 text-apex-warning mb-4 opacity-80" />
              <h2 className="text-xl font-black text-white tracking-wide text-center">ACCESS DENIED</h2>
              <p className="text-sm mt-2 text-center px-4">Manager privileges required.</p>
          </div>
      );
  }

  if (loading || !data) return (
    <div className="h-[50vh] flex flex-col items-center justify-center text-apex-muted animate-pulse">
        <TrendingUp className="h-8 w-8 mb-4 opacity-50" />
        <span className="text-sm font-medium">Crunching numbers...</span>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 pb-24">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">Financials</h1>
        <p className="text-xs md:text-sm text-apex-muted">Real-time P&L Overview</p>
      </div>

      {/* 1. SMART KPI GRID (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <KpiCard 
            title="Gross Profit" 
            value={`$${data.kpi.sales_profit.toLocaleString()}`} 
            icon={<TrendingUp className="text-apex-success w-4 h-4 md:w-5 md:h-5"/>} 
          />
          <KpiCard 
            title="Total Revenue" 
            value={`$${data.kpi.total_revenue.toLocaleString()}`} 
            icon={<DollarSign className="text-apex-info w-4 h-4 md:w-5 md:h-5"/>} 
          />
          <KpiCard 
            title="Asset Value" 
            value={`$${data.kpi.inventory_value.toLocaleString()}`} 
            icon={<Briefcase className="text-purple-400 w-4 h-4 md:w-5 md:h-5"/>} 
          />
          <KpiCard 
            title="Service Rev" 
            value={`$${data.kpi.service_revenue.toLocaleString()}`} 
            icon={<DollarSign className="text-apex-warning w-4 h-4 md:w-5 md:h-5"/>} 
          />
      </div>

      {/* 2. RESPONSIVE CHART */}
      <Card className="shadow-lg border border-apex-border bg-apex-surface">
        <CardHeader className="border-b border-apex-border bg-apex-black/30 py-3 md:py-4 px-4">
            <CardTitle className="text-white font-bold tracking-wide text-sm md:text-lg">Revenue vs. Profit (6 Mo)</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
            {/* Height adjusts: shorter on mobile to fit screen */}
            <div className="h-[250px] md:h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chart_data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A2E35" />
                        <XAxis dataKey="name" stroke="#A8ADB3" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                        <YAxis tickFormatter={(val) => `$${val/1000}k`} stroke="#A8ADB3" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{ fill: '#2F3A44', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: '#1C1F26', borderColor: '#2A2E35', color: '#F1F3F5', fontSize: '12px', borderRadius: '8px' }}
                            formatter={(value:any) => `$${value.toLocaleString()}`}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconSize={8} />
                        <Bar dataKey="Revenue" fill="#3A86FF" name="Revenue" radius={[2,2,0,0]} />
                        <Bar dataKey="Cost" fill="#E63946" name="Cost" radius={[2,2,0,0]} />
                        <Bar dataKey="Profit" fill="#2ECC71" name="Profit" radius={[2,2,0,0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>

      {/* 3. RECENT SALES - HYBRID VIEW (Cards on Mobile, Table on Desktop) */}
      <Card className="shadow-lg border border-apex-border bg-apex-surface overflow-hidden">
          <CardHeader className="border-b border-apex-border bg-apex-black/30 py-3 md:py-4 px-4">
              <CardTitle className="text-white font-bold tracking-wide text-sm md:text-lg">Recent Sales Margins</CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-apex-surface">
              
              {/* MOBILE VIEW: Card List */}
              <div className="block md:hidden divide-y divide-apex-border/50">
                {data.recent_sales.map((sale:any, i:number) => (
                    <div key={i} className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-white text-sm">{sale.vehicle}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${sale.margin > 15 ? 'bg-apex-success/10 text-apex-success border-apex-success/20' : 'bg-apex-warning/10 text-apex-warning border-apex-warning/20'}`}>
                                {sale.margin}% Margin
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <div className="text-apex-muted">
                                Sold: <span className="text-apex-silver">${sale.sold_for.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-apex-success font-bold">
                                <TrendingUp size={12} />
                                +${sale.profit.toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))}
              </div>

              {/* DESKTOP VIEW: Table */}
              <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-apex-black text-xs uppercase font-bold text-apex-silver tracking-wider border-b border-apex-border">
                          <tr>
                              <th className="px-6 py-4">Vehicle</th>
                              <th className="px-6 py-4">Sold Price</th>
                              <th className="px-6 py-4">Cost</th>
                              <th className="px-6 py-4 text-apex-success">Profit</th>
                              <th className="px-6 py-4">Margin %</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-apex-border/50">
                          {data.recent_sales.map((sale:any, i:number) => (
                              <tr key={i} className="hover:bg-apex-black/50 transition-colors">
                                  <td className="px-6 py-4 font-bold text-white">{sale.vehicle}</td>
                                  <td className="px-6 py-4 text-apex-text">${sale.sold_for.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-apex-muted">${sale.cost.toLocaleString()}</td>
                                  <td className="px-6 py-4 font-black text-apex-success">+${sale.profit.toLocaleString()}</td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold border ${sale.margin > 15 ? 'bg-apex-success/10 text-apex-success border-apex-success/20' : 'bg-apex-warning/10 text-apex-warning border-apex-warning/20'}`}>
                                          {sale.margin}%
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </CardContent>
      </Card>
    </div>
  );
};

// Internal KPI Card Component - Mobile Optimized
const KpiCard = ({ title, value, icon }: any) => (
    <Card className="bg-apex-surface border border-apex-border shadow-sm hover:border-apex-blue/50 transition-colors">
        <CardContent className="p-3 md:p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-1 md:mb-2">
                <p className="text-[10px] md:text-xs font-bold text-apex-muted uppercase tracking-wider truncate pr-1">{title}</p>
                <div className="p-1.5 md:p-3 bg-apex-black rounded-lg md:rounded-xl border border-apex-border shadow-inner shrink-0">
                    {icon}
                </div>
            </div>
            {/* Responsive Text Size: smaller on mobile to prevent wrapping */}
            <h3 className="text-lg md:text-3xl font-black text-white tracking-tight truncate">{value}</h3>
        </CardContent>
    </Card>
);