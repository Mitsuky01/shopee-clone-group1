'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/utils/firebase';

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const isStockInsufficient = false; 

  return (
    <div className={`grid grid-cols-6 gap-4 items-center p-4 border-b ${isStockInsufficient ? 'bg-red-50' : ''}`}>
      <div className="col-span-2 flex items-center">
        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover mr-4 rounded" />
        <div>
          <p className="font-semibold text-gray-800">{item.name}</p>
          {isStockInsufficient && <p className="text-red-600 text-sm">Stok tidak mencukupi</p>}
        </div>
      </div>
      <div className="text-gray-600">
        Rp{item.price.toLocaleString('id-ID')}
      </div>
      <div className="flex items-center border rounded w-fit">
        <button onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)} className="px-3 py-1 text-lg font-bold">-</button>
        <span className="px-4 py-1">{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)} className="px-3 py-1 text-lg font-bold">+</button>
      </div>
      <div className="font-semibold text-gray-800 text-right">
        Rp{(item.price * item.quantity).toLocaleString('id-ID')}
      </div>
      <div className="text-right">
        <button onClick={() => onRemove(item.productId)} className="text-red-500 hover:text-red-700 font-medium">Hapus</button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (!user) {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      console.error("Objek Firebase Auth tidak tersedia.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchCartData = async () => {
      setLoading(true);
      const cartRef = doc(db, 'carts', currentUser.uid);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        setCartItems(cartSnap.data().items || []);
      } else {
        setCartItems([]);
      }
      setLoading(false);
    };
    fetchCartData();
  }, [currentUser]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (!currentUser) return;
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    const updatedItems = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    await updateDoc(doc(db, 'carts', currentUser.uid), { items: updatedItems });
  };

  const handleRemoveItem = async (productId) => {
    if (!currentUser) return;
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedItems);
    await updateDoc(doc(db, 'carts', currentUser.uid), { items: updatedItems });
  };

  const handlePurchase = async () => {
    if (!currentUser || cartItems.length === 0) {
      alert("Keranjang kosong atau Anda belum login.");
      return;
    }
    const newOrder = {
      userId: currentUser.uid,
      items: cartItems,
      totalPrice: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
      createdAt: serverTimestamp(),
      status: 'Selesai'
    };
    try {
      await addDoc(collection(db, "orders"), newOrder);
      const cartRef = doc(db, 'carts', currentUser.uid);
      await updateDoc(cartRef, { items: [] });
      setCartItems([]);
      alert("Pembelian berhasil! Pesanan Anda telah dibuat.");
      router.push('/order-history');
    } catch (error) {
      console.error("Error saat membuat pesanan: ", error);
      alert("Terjadi kesalahan saat melakukan pembelian.");
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (loading) {
    return <p className="text-center p-8">Memuat Keranjang...</p>;
  }
  
  if (!currentUser) {
    return <p className="text-center p-8">Silakan login untuk melihat keranjang Anda.</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Keranjang Saya</h1>
        <div className="bg-white rounded-lg shadow-md">
          <div className="grid grid-cols-6 gap-4 font-semibold text-gray-600 p-4 border-b">
            <div className="col-span-2">Produk</div>
            <div>Harga Satuan</div>
            <div>Kuantitas</div>
            <div className="text-right">Total Harga</div>
            <div className="text-right">Aksi</div>
          </div>
          
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <CartItem 
                key={item.productId} 
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))
          ) : (
            <div className="text-center p-12">
              <p className="text-gray-500 mb-4">Keranjang Anda masih kosong.</p>
              <Link href="/customer/dashboard">
                <button className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 font-semibold">
                  Mulai Belanja
                </button>
              </Link>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
            <Link href="/customer/dashboard">
              <button className="text-orange-500 font-semibold hover:underline">
                ← Lanjut Belanja
              </button>
            </Link>
            <div className="flex flex-col items-end mt-4 md:mt-0">
              <div className="text-xl font-bold text-gray-800 mb-4">
                <span>Total Harga: </span>
                <span>Rp{totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <button 
                onClick={handlePurchase} 
                className="bg-orange-500 text-white px-10 py-3 rounded-md text-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Beli
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
