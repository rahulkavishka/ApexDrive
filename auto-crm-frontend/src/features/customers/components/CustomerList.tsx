import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users, ChevronRight, User } from 'lucide-react';
import { CustomerProfileModal } from './CustomerProfileModal';

export const CustomerList = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/customers/360/', {
            headers: { Authorization: `Token ${token}` }
        });
        setCustomers(res.data);
      } catch (error) {
        console.error("Failed to load customers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Filter
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight">CUSTOMER 360°</h1>
           <p className="text-apex-muted mt-1">Client Directory & Lifetime History</p>
        </div>
      </div>

      {/* Explicitly using bg-apex-surface to fix white background issue */}
      <Card className="bg-apex-surface border border-apex-border shadow-xl">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between pb-4 border-b border-apex-border gap-4 bg-apex-blue/10 rounded-t-xl py-4">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-apex-silver uppercase tracking-wider">
            <Users className="h-4 w-4 text-apex-red" />
            Client Database
          </CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-apex-muted" />
            <Input 
              placeholder="Search Name or Phone..." 
              className="pl-10 bg-apex-black border-apex-border text-white placeholder:text-gray-500 focus:border-apex-red focus:ring-1 focus:ring-apex-red"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0 bg-apex-surface rounded-b-xl">
          {loading ? (
             <div className="text-center py-20 text-apex-muted animate-pulse">Loading directory...</div>
          ) : (
            <div className="divide-y divide-apex-border/50">
              {filteredCustomers.map((customer, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between py-4 px-3 hover:bg-apex-black/50 rounded-lg cursor-pointer transition-all duration-200 group border border-transparent hover:border-apex-border/50 my-1"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar / Initials */}
                    <div className="h-12 w-12 rounded-xl bg-apex-black border border-apex-border flex items-center justify-center text-white font-black shadow-inner group-hover:border-apex-gray transition-colors">
                        {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg group-hover:text-apex-red transition-colors">{customer.name}</p>
                      <p className="text-sm text-apex-muted font-medium flex items-center gap-2">
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold text-apex-silver uppercase tracking-wider">Lifetime Spend</p>
                      <p className="font-black text-apex-success text-xl tracking-tight">
                        ${customer.lifetime_value.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Arrow Button */}
                    <div className="h-10 w-10 rounded-full bg-apex-black flex items-center justify-center border border-apex-border group-hover:bg-apex-red group-hover:border-apex-red transition-all shadow-lg">
                        <ChevronRight className="h-5 w-5 text-apex-muted group-hover:text-white" />
                    </div>
                  </div>
                </div>
              ))}

              {filteredCustomers.length === 0 && (
                  <div className="py-12 text-center text-apex-muted italic border border-dashed border-apex-border rounded-xl mt-4">
                      No customers found matching "{searchTerm}"
                  </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* THE 360 MODAL */}
      <CustomerProfileModal 
        customer={selectedCustomer} 
        isOpen={!!selectedCustomer} 
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};