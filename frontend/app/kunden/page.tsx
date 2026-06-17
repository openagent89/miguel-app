'use client';

import { useState } from 'react';

const articles = [
  { id: 1, name: "Premium Box", sku: "PB-001", stock: 124, price: 29.90 },
  { id: 2, name: "Standard Box", sku: "SB-002", stock: 387, price: 19.90 },
  { id: 3, name: "Mini Box", sku: "MB-003", stock: 215, price: 12.90 },
];

export default function KundenPortal() {
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (article: any) => {
    setCart([...cart, article]);
    alert(`${article.name} wurde in den Warenkorb gelegt`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Kunden-Portal – M&I Deals</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map(article => (
          <div key={article.id} className="bg-white p-6 rounded-2xl shadow">
            <div className="font-semibold text-xl">{article.name}</div>
            <div className="text-sm text-gray-500">{article.sku}</div>
            <div className="mt-4 text-3xl font-bold">€{article.price}</div>
            <div className="text-sm mt-1">Lager: {article.stock} Stück</div>
            <button 
              onClick={() => addToCart(article)}
              className="mt-6 w-full py-3 bg-black text-white rounded-xl font-medium"
            >
              In den Warenkorb
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Warenkorb ({cart.length})</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500">Noch keine Artikel im Warenkorb</div>
        ) : (
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between border-b pb-3">
                <span>{item.name}</span>
                <span>€{item.price}</span>
              </div>
            ))}
            <button className="mt-6 w-full py-4 bg-green-600 text-white rounded-xl font-medium">
              Jetzt bestellen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}