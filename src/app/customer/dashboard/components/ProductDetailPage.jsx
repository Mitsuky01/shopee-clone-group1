'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import Navbar from './Navbar';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [sellerEmail, setSellerEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductAndSeller = async () => {
      try {
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data();
          setProduct(productData);

          if (productData.sellerId) {
            const sellerRef = doc(db, 'users', productData.sellerId);
            const sellerSnap = await getDoc(sellerRef);

            if (sellerSnap.exists()) {
              setSellerEmail(sellerSnap.data().email);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductAndSeller();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!product) return <p className="p-4 text-red-500">Produk tidak ditemukan</p>;

  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      {/* Minimal Navbar (Logo Only) */}
      <Navbar minimal />

      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-white p-6 rounded shadow">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover rounded mb-4"
          />

          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>

          <p className="text-orange-600 text-lg font-semibold mb-2">
            Rp {product.price.toLocaleString()}
          </p>

          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Kategori:</strong> {product.category}</p>
            <p><strong>Stok:</strong> {product.quantity}</p>
            <p><strong>Seller:</strong> {sellerEmail || 'Tidak ditemukan'}</p>
          </div>
        </div>
      </div>

      {/* Back button bottom left-center */}
      <div className="mt-6 pl-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
