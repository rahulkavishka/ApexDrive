import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, User, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      // App.tsx will automatically switch to Dashboard when user state changes
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apex-black p-4 relative overflow-hidden">
      
      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-apex-blue/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-apex-red/10 rounded-full blur-[100px]"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-apex-border bg-apex-surface text-apex-text relative z-10">
        <CardHeader className="text-center space-y-2 border-b border-apex-border pb-6">
          <div className="mx-auto bg-apex-black border border-apex-border w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <ShieldCheck className="h-8 w-8 text-apex-red" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight italic">
            APEX<span className="text-apex-red">DRIVE</span>
          </CardTitle>
          <p className="text-apex-muted text-sm uppercase tracking-widest font-medium">Secure Dealer Access</p>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <Label className="text-apex-silver text-xs uppercase font-bold tracking-wider">Username</Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-5 w-5 text-apex-muted group-focus-within:text-apex-red transition-colors" />
                <Input 
                  className="pl-10 h-12 bg-apex-black border-apex-border text-white placeholder:text-apex-muted/30 focus:ring-2 focus:ring-apex-red focus:border-transparent transition-all"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-apex-silver text-xs uppercase font-bold tracking-wider">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-apex-muted group-focus-within:text-apex-red transition-colors" />
                <Input 
                  type="password"
                  className="pl-10 h-12 bg-apex-black border-apex-border text-white placeholder:text-apex-muted/30 focus:ring-2 focus:ring-apex-red focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded bg-apex-error/10 border border-apex-error/20 text-apex-error text-sm text-center font-medium animate-pulse">
                {error}
              </div>
            )}

            <Button 
                type="submit" 
                className="w-full bg-apex-red hover:bg-red-600 text-white h-12 text-lg font-bold tracking-wide shadow-lg shadow-apex-red/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-xs text-apex-muted/50 mt-6 pt-6 border-t border-apex-border/50">
            <p>Protected System • Authorized Personnel Only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};