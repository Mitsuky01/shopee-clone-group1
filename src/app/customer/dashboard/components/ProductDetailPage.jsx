'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/utils/firebase';
import Navbar from './Navbar'; 

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [sellerEmail, setSellerEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 

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

  const handleAddToCart = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.");
      router.push('/login');
      return;
    }
    if (quantity > product.quantity) {
      alert("Stok tidak mencukupi!");
      return;
    }
    const cartRef = doc(db, 'carts', user.uid);
    const cartSnap = await getDoc(cartRef);
    try {
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const itemIndex = cartData.items.findIndex(item => item.productId === id);
        if (itemIndex > -1) {
          const newItems = [...cartData.items];
          newItems[itemIndex].quantity += quantity;
          await updateDoc(cartRef, { items: newItems });
        } else {
          await updateDoc(cartRef, {
            items: arrayUnion({ productId: id, name: product.name, price: product.price, image: product.image, quantity: quantity })
          });
        }
      } else {
        await setDoc(cartRef, {
          items: [{ productId: id, name: product.name, price: product.price, image: product.image, quantity: quantity }]
        });
      }
      alert(`${quantity} ${product.name} berhasil ditambahkan ke keranjang!`);
    } catch (error) {
      console.error("Error menambahkan ke keranjang: ", error);
      alert("Gagal menambahkan produk ke keranjang.");
    }
  };

  const handleBuyNow = () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Silakan login terlebih dahulu untuk membeli produk.");
      router.push('/login');
      return;
    }
    if (quantity > product.quantity) {
      alert("Stok tidak mencukupi!");
      return;
    }
    setIsModalOpen(true);
  };


  const handleConfirmPurchase = async () => {
    const user = auth.currentUser;
    if (!user || isProcessing) return; 

    setIsProcessing(true); 

    const newOrder = {
      userId: user.uid,
      items: [{
        productId: id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      }],
      totalPrice: product.price * quantity,
      createdAt: serverTimestamp(),
      status: 'Selesai'
    };

    try {
      await addDoc(collection(db, "orders"), newOrder);
      
      setIsModalOpen(false); 
      alert("Pembelian berhasil! Pesanan Anda telah dibuat dan dapat dilihat di halaman Riwayat Pesanan."); 

    } catch (error) {
      console.error("Error saat membuat pesanan: ", error);
      alert("Gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false); 
    }
  };


  if (loading) return <p className="p-4 text-center">Loading...</p>;
  if (!product) return <p className="p-4 text-center text-red-500">Produk tidak ditemukan</p>;

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <Navbar minimal />
        <div className="container mx-auto p-4 md:p-8">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="w-full aspect-square rounded-lg border bg-gray-50 p-4 flex items-center justify-center">
                <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <p className="text-gray-500 mb-4">{product.description}</p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-3xl text-orange-600 font-bold mb-4">Rp{product.price.toLocaleString('id-ID')}</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Kategori:</strong> {product.category}</p>
                    <p><strong>Stok Tersisa:</strong> {product.quantity} buah</p>
                    <p><strong>Penjual:</strong> {sellerEmail || 'Tidak ditemukan'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <label className="font-semibold">Kuantitas:</label>
                  <div className="flex items-center border rounded">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-lg">-</button>
                    <span className="px-6 py-2">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))} className="px-4 py-2 text-lg">+</button>
                  </div>
                </div>
                <div className="mt-auto flex flex-col sm:flex-row gap-4">
                  <button onClick={handleAddToCart} className="w-full px-6 py-3 border border-orange-500 text-orange-500 font-bold rounded-lg hover:bg-orange-50 transition-colors">+ Keranjang</button>
                  <button onClick={handleBuyNow} className="w-full px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">Beli Sekarang</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800 font-semibold">← Kembali ke halaman sebelumnya</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Konfirmasi Pembelian</h2>
            <div className="border-t border-b py-4 my-4">
              <div className="flex items-center">
                <img src={product.image} alt={product.name} className="w-20 h-20 object-contain mr-4 rounded border p-1" />
                <div>
                  <p className="font-semibold text-gray-700">{product.name}</p>
                  <p className="text-sm text-gray-500">{quantity} x Rp{product.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center font-bold text-lg text-gray-800">
              <span>Total Pesanan:</span>
              <span className="text-orange-600">Rp{(product.price * quantity).toLocaleString('id-ID')}</span>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold" disabled={isProcessing}>Batal</button>
              <button onClick={handleConfirmPurchase} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold flex items-center justify-center min-w-[120px]" disabled={isProcessing}>
                {isProcessing ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Iya, Beli'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
