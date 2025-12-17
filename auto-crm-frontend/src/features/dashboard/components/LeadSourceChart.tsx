import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from 'lucide-react';

// APEX PALETTE COLORS
// Blue (Info), Green (Success), Amber (Warning), Red (Action), Silver (Premium)
const COLORS = ['#3A86FF', '#2ECC71', '#F4A261', '#E63946', '#BFC9D1'];

export const LeadSourceChart = ({ data }: { data: any[] }) => {
  const cleanData = data.map(item => ({
      name: item.source, 
      value: item.value  
  }));

  return (
    // Explicitly set Dark Background and Border
    <Card className="bg-apex-surface border-apex-border h-full">
      <CardHeader className="border-b border-apex-border/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-apex-silver uppercase tracking-wider">
            <Users className="w-4 h-4 text-apex-info"/> Lead Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={cleanData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none" // Removes the white outline to look clean on dark mode
            >
              {cleanData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            
            {/* Custom Dark Tooltip */}
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#1C1F26', // Apex Surface
                    borderColor: '#2A2E35',     // Apex Border
                    color: '#F1F3F5',           // Apex Text
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: '#F1F3F5' }}
            />
            
            <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ color: '#A8ADB3', fontSize: '12px', fontWeight: 500 }} // Apex Muted text
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};