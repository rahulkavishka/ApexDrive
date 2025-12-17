import { forwardRef } from 'react';
import { DollarSign } from 'lucide-react';

export const PrintableInvoice = forwardRef((props: { job: any }, ref: any) => {
    if (!props.job) return null;
    const { job } = props;

    const parts = Number(job.parts_cost) || 0;
    const labor = Number(job.labor_cost) || 0;
    const total = parts + labor;

    return (
        <div ref={ref} className="p-10 max-w-[800px] mx-auto bg-white text-slate-800 hidden print:block font-sans">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-8 border-b-4 border-blue-600 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 uppercase">ApexDrive</h1>
                    <p className="text-slate-500 mt-1">Automotive Service Center</p>
                    <p className="text-sm text-slate-500">123 Dealership Way, Auto City, CA 90210</p>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold text-blue-600">INVOICE</h2>
                    <p className="text-lg font-mono text-slate-600">#{job.id.toString().padStart(6, '0')}</p>
                    <p className="text-sm text-slate-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* BILL TO */}
            {/* BILL TO */}
            <div className="mb-10 flex justify-between bg-slate-50 p-6 rounded-lg">
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>

                    {/* UPDATED LINES */}
                    <p className="text-xl font-bold text-slate-800">
                        {job.customer_name || "Valued Customer"}
                    </p>
                    <p className="text-sm text-slate-500 mb-1">
                        {job.customer_phone || ""}
                    </p>
                    {/* ------------- */}

                    <p className="text-slate-600 mt-2">{job.vehicle_details?.license_plate}</p>
                    <p className="text-slate-600">{job.vehicle_details?.make} {job.vehicle_details?.model}</p>
                </div>

                <div className="text-right">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service ID</h3>
                    <p className="font-mono font-bold text-lg">#{job.id}</p>
                </div>
            </div>

            {/* LINE ITEMS */}
            <div className="mb-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="py-3 text-sm font-bold text-slate-500 uppercase">Description</th>
                            <th className="py-3 text-sm font-bold text-slate-500 uppercase text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="py-4">
                                <p className="font-bold text-slate-800">Primary Service Task</p>
                                <p className="text-sm text-slate-500">{job.description}</p>
                            </td>
                            <td className="py-4 text-right font-mono text-slate-600">Included</td>
                        </tr>
                        <tr>
                            <td className="py-4 font-medium text-slate-700">Parts & Materials</td>
                            <td className="py-4 text-right font-mono text-slate-800">${parts.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="py-4 font-medium text-slate-700">Labor Charges</td>
                            <td className="py-4 text-right font-mono text-slate-800">${labor.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* TOTALS */}
            <div className="flex justify-end mb-12">
                <div className="w-1/2 bg-blue-50 p-6 rounded-lg">
                    <div className="flex justify-between mb-2">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-mono font-bold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4 border-b border-blue-200 pb-2">
                        <span className="text-slate-500">Tax (0%)</span>
                        <span className="font-mono font-bold">$0.00</span>
                    </div>
                    <div className="flex justify-between text-xl font-extrabold text-blue-800">
                        <span>Total Due</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-slate-200 pt-8 text-center">
                <p className="font-bold text-slate-800 mb-2">Thank you for your business!</p>
                <p className="text-sm text-slate-500">Payment is due upon receipt. Please make checks payable to ApexDrive.</p>
                <div className="flex justify-center gap-2 mt-4 text-slate-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">ApexDrive Official Invoice</span>
                </div>
            </div>
        </div>
    );
});