import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { Car, Wrench, Calendar, User, DollarSign, History, X } from "lucide-react"; 

interface HistoryEvent {
  type: 'SALE' | 'SERVICE';
  date: string;
  status: string;
  description: string;
  amount: number;
}

interface Customer {
  name: string;
  phone: string;
  lifetime_value: number;
  history: HistoryEvent[];
}

interface Props {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerProfileModal = ({ customer, isOpen, onClose }: Props) => {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Added rounded-2xl to the className list */}
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden bg-apex-surface border-apex-border text-white shadow-2xl [&>button]:hidden p-0 gap-0 flex flex-col rounded-2xl">
        
        {/* HEADER SECTION (Fixed at top) */}
        <div className="border-b border-apex-border bg-apex-black/30 p-4 md:p-6 relative shrink-0">
          
          {/* Custom Close Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 md:top-3 md:right-3 text-apex-muted hover:text-white hover:bg-apex-surface rounded-full z-50 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Header Content */}
          <div className="flex flex-row justify-between items-center gap-2 md:gap-4 pr-8 md:pr-10"> 
            
            {/* Left: Avatar & Name */}
            <div className="flex gap-3 md:gap-4 items-center overflow-hidden">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-apex-black border border-apex-border flex items-center justify-center shadow-inner shrink-0">
                    <User className="h-6 w-6 md:h-8 md:w-8 text-apex-silver" />
                </div>
                <div className="min-w-0">
                    <DialogTitle className="text-lg md:text-3xl font-black text-white tracking-tight truncate">
                        {customer.name}
                    </DialogTitle>
                    <DialogDescription className="text-apex-muted font-medium mt-0.5 md:mt-1 text-sm md:text-lg truncate">
                        {customer.phone}
                    </DialogDescription>
                </div>
            </div>

            {/* Right: Lifetime Value Badge (Adapts to Mobile) */}
            <div className="text-right shrink-0">
                <p className="text-[10px] font-bold text-apex-silver uppercase tracking-wider mb-1 hidden md:block">Lifetime Value</p>
                <div className="flex items-center gap-1.5 bg-apex-success/10 px-2 md:px-3 py-1 rounded border border-apex-success/20">
                    <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-apex-success" />
                    <span className="text-base md:text-xl font-black text-apex-success">
                        {customer.lifetime_value.toLocaleString()}
                    </span>
                </div>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT SECTION */}
        <div className="p-4 md:p-6 overflow-y-auto scrollbar-thin scrollbar-track-apex-black scrollbar-thumb-apex-gray">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xs md:text-sm font-bold text-apex-silver uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4" /> Customer Journey
             </h3>
             <Badge variant="outline" className="text-apex-muted border-apex-border text-[10px] md:text-xs">
                {customer.history.length} Records
             </Badge>
          </div>
          
          <div className="space-y-3">
            {customer.history.map((event, index) => (
              <div key={index} className="flex gap-3 md:gap-4 items-start p-3 md:p-4 rounded-xl border border-apex-border bg-apex-black/40 hover:bg-apex-black hover:border-apex-gray transition-all group">
                {/* Icon Box */}
                <div className={`p-2 md:p-3 rounded-xl border shadow-inner shrink-0 ${
                    event.type === 'SALE' 
                        ? 'bg-apex-blue/20 border-apex-info/30 text-apex-info' 
                        : 'bg-apex-warning/10 border-apex-warning/20 text-apex-warning'
                }`}>
                  {event.type === 'SALE' ? <Car className="h-4 w-4 md:h-5 md:w-5" /> : <Wrench className="h-4 w-4 md:h-5 md:w-5" />}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-bold text-white group-hover:text-apex-red transition-colors text-sm md:text-lg truncate">
                        {event.description}
                    </h4>
                    <span className="font-mono font-bold text-white text-sm md:text-lg whitespace-nowrap">
                        ${event.amount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs md:text-sm text-apex-muted mt-1 md:mt-2">
                    <span className="flex items-center gap-1.5 bg-apex-black px-1.5 md:px-2 py-0.5 md:py-1 rounded border border-apex-border/50 font-medium">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                    </span>
                    
                    <Badge className={`border-none text-white text-[10px] md:text-xs px-1.5 py-0 ${
                        event.status === 'COMPLETED' || event.status === 'SOLD' ? 'bg-apex-success' : 'bg-apex-gray'
                    }`}>
                        {event.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            {customer.history.length === 0 && (
                <div className="text-center py-8 md:py-12 text-apex-muted italic border-2 border-dashed border-apex-border rounded-xl bg-apex-black/20 text-sm">
                    No history found for this customer.
                </div>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};