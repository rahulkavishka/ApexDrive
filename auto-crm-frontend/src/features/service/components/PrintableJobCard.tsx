import { forwardRef } from 'react';

export const PrintableJobCard = forwardRef((props: { job: any }, ref: any) => {
  if (!props.job) return null;
  const { job } = props;

  return (
    <div ref={ref} className="p-8 max-w-[800px] mx-auto bg-white text-black hidden print:block">
      {/* HEADER */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">ApexDrive</h1>
          <p className="text-sm">123 Dealership Way, Auto City, CA 90210</p>
          <p className="text-sm">Hotline: (555) 019-2834</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-700">SERVICE TICKET</h2>
          <p className="text-lg font-mono">#{job.id.toString().padStart(6, '0')}</p>
          <p className="text-sm mt-1">Date: {new Date(job.date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* VEHICLE INFO */}
      <div className="mb-8 p-4 border border-slate-300 rounded-lg bg-slate-50 print:bg-transparent print:border-black">
        <h3 className="font-bold border-b border-slate-300 mb-2 pb-1">VEHICLE DETAILS</h3>
        <div className="grid grid-cols-3 gap-4">
            <div>
                <span className="block text-xs uppercase text-slate-500">License Plate</span>
                <span className="font-mono font-bold text-xl">{job.vehicle_details?.license_plate}</span>
            </div>
            <div>
                <span className="block text-xs uppercase text-slate-500">Make / Model</span>
                <span className="font-bold">{job.vehicle_details?.make} {job.vehicle_details?.model}</span>
            </div>
        </div>
      </div>

      {/* SERVICE DETAILS */}
      <div className="mb-8">
        <h3 className="font-bold border-b-2 border-black mb-4 pb-1">REQUESTED SERVICES</h3>
        <div className="min-h-[200px]">
            <div className="flex justify-between items-start py-2 border-b border-slate-200">
                <span className="font-medium text-lg">1. {job.description}</span>
                <span className="h-6 w-6 border border-black rounded-sm inline-block"></span>
            </div>
            {/* Empty lines for mechanic notes */}
            <div className="flex justify-between items-start py-4 border-b border-dashed border-slate-300">
                <span className="text-slate-400 italic">Mechanic Notes:</span>
            </div>
            <div className="flex justify-between items-start py-4 border-b border-dashed border-slate-300">
                <span className="text-slate-400 italic">Parts Used:</span>
            </div>
             <div className="flex justify-between items-start py-4 border-b border-dashed border-slate-300">
                <span className="text-slate-400 italic">Labor Hours:</span>
            </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 pt-4 border-t-2 border-black flex justify-between items-end">
        <div className="text-center">
            <div className="h-16 w-40 border-b border-black mb-2"></div>
            <p className="text-xs uppercase">Service Advisor Signature</p>
        </div>
        <div className="text-center">
            <div className="h-16 w-40 border-b border-black mb-2"></div>
            <p className="text-xs uppercase">Customer Signature</p>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-500">
        <p>Thank you for choosing ApexDrive. Please retain this document for warranty purposes.</p>
      </div>
    </div>
  );
});