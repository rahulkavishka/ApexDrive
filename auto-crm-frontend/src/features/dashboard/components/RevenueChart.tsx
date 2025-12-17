import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';

// Accept data as props
export const RevenueChart = ({ data }: { data: any[] }) => {
    return (
        // Explicitly set Dark Background and Border
        <Card className="bg-apex-surface border-apex-border h-full">
            <CardHeader className="border-b border-apex-border/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-apex-silver uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 text-apex-success" /> Revenue (6 Months)
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-6">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-apex-muted/50 border border-dashed border-apex-border rounded-xl">
                        No revenue data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            {/* Dark Grid Lines - Subtle and clean */}
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                vertical={false} 
                                stroke="#2A2E35" // Dark border color for grid
                            />
                            
                            {/* Axis Labels - Silver/Muted */}
                            <XAxis 
                                dataKey="name" 
                                stroke="#A8ADB3" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                dy={10} 
                            />
                            <YAxis 
                                stroke="#A8ADB3" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(value) => `$${value/1000}k`} 
                                dx={-10}
                            />
                            
                            {/* Custom Dark Tooltip */}
                            <Tooltip
                                cursor={{ fill: '#2F3A44', opacity: 0.4 }} // Dark hover bar
                                contentStyle={{ 
                                    backgroundColor: '#1C1F26', // Apex Surface
                                    borderColor: '#2A2E35',     // Apex Border
                                    color: '#F1F3F5',           // Apex Text
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                                }}
                                itemStyle={{ color: '#2ECC71', fontWeight: 'bold' }} // Green Value Text
                                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                            />
                            
                            {/* Racing Green Bars */}
                            <Bar 
                                dataKey="total" 
                                fill="#2ECC71" 
                                radius={[4, 4, 0, 0]} 
                                barSize={40} 
                                activeBar={{ fill: '#25a25a' }} // Slightly darker on hover
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};