import React from "react";

// We wrap the component in forwardRef so the Print library can access it
export const BillOfSale = React.forwardRef((props: any, ref: any) => {
  const { vehicle, customer, financials } = props;
  const date = new Date().toLocaleDateString();

  if (!vehicle) return null;

  return (
    <div ref={ref} className="p-10 font-serif text-black bg-white max-w-4xl mx-auto hidden-print">
      {/* HEADER */}
      <div className="text-center border-b-4 border-black pb-4 mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-widest">ApexDrive Motors</h1>
        <p className="text-sm mt-1">123 Dealership Way, Auto City, CA 90210 • (555) 019-2834</p>
        <h2 className="text-2xl font-bold mt-4 uppercase underline">Vehicle Purchase Agreement</h2>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        
        {/* BUYER INFO */}
        <div className="border border-black p-4">
          <h3 className="font-bold bg-gray-200 p-1 mb-2 border-b border-black text-sm uppercase">Buyer Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-bold">Name:</span> {customer.name || "_________________"}</p>
            <p><span className="font-bold">Phone:</span> {customer.phone || "_________________"}</p>
            <p><span className="font-bold">Date:</span> {date}</p>
          </div>
        </div>

        {/* VEHICLE INFO */}
        <div className="border border-black p-4">
          <h3 className="font-bold bg-gray-200 p-1 mb-2 border-b border-black text-sm uppercase">Vehicle Description</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-bold">Year/Make/Model:</span> {vehicle.year} {vehicle.make} {vehicle.model}</p>
            <p><span className="font-bold">VIN:</span> {vehicle.vin || "N/A"}</p>
            <p><span className="font-bold">Stock #:</span> {vehicle.stock_number}</p>
            <p><span className="font-bold">Color:</span> {vehicle.color || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* FINANCIALS */}
      <div className="mb-8">
         <h3 className="font-bold bg-gray-800 text-white p-2 mb-0 text-sm uppercase">Financial Breakdown</h3>
         <table className="w-full text-sm border-collapse border border-black">
            <tbody>
                <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">1. Vehicle Selling Price</td>
                    <td className="p-2 text-right">${financials.price.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">2. Down Payment</td>
                    <td className="p-2 text-right">(${financials.down.toFixed(2)})</td>
                </tr>
                <tr className="border-b border-black bg-gray-100">
                    <td className="p-2 border-r border-black font-bold">3. Amount Financed (1 - 2)</td>
                    <td className="p-2 text-right font-bold">${(financials.price - financials.down).toFixed(2)}</td>
                </tr>
                <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">4. Estimated APR</td>
                    <td className="p-2 text-right">{financials.apr}%</td>
                </tr>
                <tr className="border-b border-black">
                    <td className="p-2 border-r border-black font-bold">5. Term (Months)</td>
                    <td className="p-2 text-right">{financials.term}</td>
                </tr>
                <tr className="bg-black text-white font-bold text-lg">
                    <td className="p-3 border-r border-white">ESTIMATED MONTHLY PAYMENT</td>
                    <td className="p-3 text-right">${financials.payment}</td>
                </tr>
            </tbody>
         </table>
      </div>

      {/* LEGAL DISCLAIMER */}
      <div className="text-xs text-justify text-gray-500 mb-12 italic border-t pt-4">
        By signing below, the Buyer acknowledges receipt of the vehicle described above and agrees that the information provided is accurate. 
        This document serves as a preliminary bill of sale and is subject to final bank approval. The vehicle is sold "AS-IS" unless a separate warranty document is attached.
        ApexDrive Motors is not responsible for any wear and tear occurring after the vehicle leaves the premises.
      </div>

      {/* SIGNATURES */}
      <div className="grid grid-cols-2 gap-16 mt-12">
        <div>
            <div className="border-b-2 border-black h-8"></div>
            <p className="text-center font-bold mt-2">Buyer Signature</p>
        </div>
        <div>
            <div className="border-b-2 border-black h-8"></div>
            <p className="text-center font-bold mt-2">Dealer Representative</p>
        </div>
      </div>

    </div>
  );
});

// Little CSS fix to hide this component when NOT printing
// Add this to your globals.css if you want, but for now it will just sit in the DOM invisibly.