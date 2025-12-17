import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Trash2, ShieldAlert, Shield, Briefcase, Wrench, ChevronDown, Calendar, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const TeamManagement = () => {
  const { isManager, token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'SALES' // Default
  });

  // --- FETCH USERS ---
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/users/', {
        headers: { Authorization: `Token ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isManager) fetchUsers();
  }, [isManager]);

  // --- HANDLERS ---
  const handleCreateUser = async () => {
    try {
      await axios.post('http://localhost:8000/api/users/', formData, {
        headers: { Authorization: `Token ${token}` }
      });
      alert("User Created Successfully! 🎉");
      setIsModalOpen(false);
      setFormData({ username: '', password: '', role: 'SALES' }); // Reset
      fetchUsers(); // Refresh list
    } catch (error: any) {
      alert("Error: " + (error.response?.data?.error || "Failed to create user"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:8000/api/users/${id}/`, {
         headers: { Authorization: `Token ${token}` }
      });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error: any) {
      alert("Error: " + (error.response?.data?.error || "Failed to delete"));
    }
  };

  // --- ACCESS DENIED UI ---
  if (!isManager) {
      return (
          <div className="h-[80vh] flex flex-col items-center justify-center text-apex-muted border-2 border-dashed border-apex-border rounded-xl bg-apex-black/20 m-4 md:m-6">
              <ShieldAlert className="h-16 w-16 text-apex-error mb-4 opacity-80" />
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide text-center">RESTRICTED ACCESS</h2>
              <p className="text-base md:text-lg mt-2 font-medium text-center px-4">Only Managers can manage the team.</p>
          </div>
      );
  }

  // Shared Dark Input Class
  const inputClass = "bg-apex-black border-apex-border text-white placeholder:text-gray-600 focus:border-apex-red focus:ring-1 focus:ring-apex-red";

  // Role Badge Helper
  const getRoleBadge = (role: string) => {
      if (role === 'Manager') return (
        <Badge className="bg-purple-900/30 text-purple-300 border border-purple-700/50 px-3 py-1 text-xs">
            <Shield className="w-3 h-3 mr-1" /> Manager
        </Badge>
      );
      if (role === 'Sales') return (
        <Badge className="bg-blue-900/30 text-blue-300 border border-blue-700/50 px-3 py-1 text-xs">
            <Briefcase className="w-3 h-3 mr-1" /> Sales Rep
        </Badge>
      );
      return (
        <Badge className="bg-orange-900/30 text-orange-300 border border-orange-700/50 px-3 py-1 text-xs">
            <Wrench className="w-3 h-3 mr-1" /> Service
        </Badge>
      );
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">Team Management</h1>
            <p className="text-sm md:text-base text-apex-muted mt-1">Manage access roles and staff accounts</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-apex-blue hover:bg-blue-600 text-white font-bold h-12 px-6 shadow-lg shadow-apex-blue/20">
            <UserPlus className="mr-2 h-5 w-5" /> ADD MEMBER
        </Button>
      </div>

      <Card className="shadow-2xl border border-apex-border bg-apex-surface">
        <CardHeader className="bg-apex-blue border-b border-apex-border rounded-t-xl py-4 px-4 md:px-6">
            <CardTitle className="flex items-center gap-2 text-white font-bold tracking-wide text-base md:text-lg">
                <Users className="h-5 w-5 text-apex-red"/> STAFF DIRECTORY
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-apex-surface rounded-b-xl">
            {loading ? (
                <div className="p-12 text-center text-apex-muted animate-pulse">Loading staff data...</div>
            ) : (
                <>
                    {/* --- DESKTOP TABLE VIEW --- */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-apex-black text-xs uppercase font-bold text-apex-silver tracking-wider border-b border-apex-border">
                                <tr>
                                    <th className="p-4">User Details</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Date Joined</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-apex-border/50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-apex-black/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-white text-lg">{user.username}</div>
                                            <div className="text-xs text-apex-muted">ID: #{user.id}</div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-4 text-apex-muted font-mono text-sm">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-apex-muted hover:text-red-500 hover:bg-red-900/20"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- MOBILE CARD VIEW --- */}
                    <div className="md:hidden p-4 space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="bg-apex-black border border-apex-border rounded-xl p-4 shadow-md flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-apex-surface p-2 rounded-full border border-apex-border">
                                            <User className="h-5 w-5 text-apex-silver" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{user.username}</h3>
                                            <p className="text-xs text-apex-muted">ID: #{user.id}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-apex-muted hover:text-red-500 h-8 w-8"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <div className="flex justify-between items-center border-t border-apex-border/50 pt-3">
                                    <div>{getRoleBadge(user.role)}</div>
                                    <div className="flex items-center gap-1 text-xs text-apex-muted">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(user.date_joined).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </CardContent>
      </Card>

      {/* ADD USER MODAL - Dark Theme */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-apex-surface border border-apex-border text-white w-[95vw] sm:max-w-md rounded-xl">
            <DialogHeader className="border-b border-apex-border pb-4">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-apex-success" /> Add New Team Member
                </DialogTitle>
                <DialogDescription className="text-apex-muted text-sm">
                    Create credentials for a new employee.
                </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5 py-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-apex-silver uppercase tracking-wide">Username</label>
                    <Input 
                        value={formData.username} 
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        placeholder="e.g. john_doe"
                        className={inputClass}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-apex-silver uppercase tracking-wide">Password</label>
                    <Input 
                        type="password"
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••"
                        className={inputClass}
                    />
                </div>
                
                {/* MODERN SELECT DROPDOWN */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-apex-silver uppercase tracking-wide">Role Assignment</label>
                    <div className="relative">
                        <select 
                            className="w-full h-10 appearance-none rounded-md border border-apex-border bg-apex-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-apex-red transition-shadow cursor-pointer"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="SALES">Sales Representative</option>
                            <option value="SERVICE">Service Staff / Technician</option>
                            <option value="MANAGER">Manager (Full Access)</option>
                        </select>
                        {/* Custom Arrow Icon */}
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-apex-muted">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>
                
                <Button className="w-full mt-6 bg-apex-success hover:bg-green-600 text-white font-bold h-12 rounded-lg" onClick={handleCreateUser}>
                    Create Account
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};