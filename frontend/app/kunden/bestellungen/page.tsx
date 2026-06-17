'use client';

export default function Bestellungen() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Meine Bestellungen</h1>
      
      <div className="bg-white rounded-2xl shadow p-8">
        <div className="space-y-6">
          <div className="border-b pb-6">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">Bestellung #M-2024-0847</div>
                <div className="text-sm text-gray-500">15. Juni 2026</div>
              </div>
              <div className="text-right">
                <div className="font-medium">€ 89,70</div>
                <div className="text-green-600 text-sm">Geliefert</div>
              </div>
            </div>
          </div>
          
          <div className="border-b pb-6">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">Bestellung #M-2024-0842</div>
                <div className="text-sm text-gray-500">10. Juni 2026</div>
              </div>
              <div className="text-right">
                <div className="font-medium">€ 149,50</div>
                <div className="text-blue-600 text-sm">In Bearbeitung</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}