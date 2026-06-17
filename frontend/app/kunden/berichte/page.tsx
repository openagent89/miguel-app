'use client';

export default function Berichte() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Berichte & Exporte</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow">
          <h3 className="font-semibold text-xl mb-4">Lagerbericht</h3>
          <button className="w-full py-3 bg-black text-white rounded-xl">PDF herunterladen</button>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow">
          <h3 className="font-semibold text-xl mb-4">Umsatzbericht</h3>
          <button className="w-full py-3 bg-black text-white rounded-xl">CSV exportieren</button>
        </div>
      </div>
    </div>
  );
}