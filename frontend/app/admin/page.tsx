'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://miguel-backend.onrender.com";

export default function AdminDashboard() {
  const [stock, setStock] = useState(0);
  const [articles, setArticles] = useState<any[]>([]);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/articles`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArticles(data);
      setStock(data.reduce((sum: number, a: any) => sum + a.stock, 0));
    } catch {
      console.log("Backend noch nicht erreichbar");
    }
  };

  const handleBooking = async (type: string) => {
    try {
      await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: 1, quantity: 50, type })
      });
      fetchArticles();
    } catch {
      alert("Buchung fehlgeschlagen");
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Miguel Warenwirtschaft – Admin</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="text-sm text-gray-500">Gesamtbestand</div>
        <div className="text-5xl font-bold">{stock}</div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Schnellbuchung</h2>
        <div className="flex gap-4">
          <button onClick={() => handleBooking('in')} className="px-8 py-4 bg-green-600 text-white rounded-xl">+50 einbuchen</button>
          <button onClick={() => handleBooking('out')} className="px-8 py-4 bg-red-600 text-white rounded-xl">-50 ausbuchen</button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Artikel</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Artikel</th>
              <th>SKU</th>
              <th>Bestand</th>
              <th>Preis</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{a.name}</td>
                <td className="text-center">{a.sku}</td>
                <td className="text-center">{a.stock}</td>
                <td className="text-center">{a.price} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
