'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; 
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/utils/firebase';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

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

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'orders'), 
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        
        const userOrders = [];
        querySnapshot.forEach((doc) => {
          userOrders.push({ id: doc.id, ...doc.data() });
        });
        
        setOrders(userOrders);
      } catch (error) {
        console.error("Error mengambil riwayat pesanan: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return <p className="text-center p-8">Memuat riwayat pesanan...</p>;
  }

  if (!currentUser) {
    return <p className="text-center p-8">Silakan login untuk melihat riwayat pesanan Anda.</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Pesanan Saya</h1>
          <Link href="/customer/dashboard">
            <button className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 font-semibold">
              Kembali Belanja
            </button>
          </Link>
        </div>
        
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-4">
                  <div>
                    <p className="font-bold text-gray-800">Order ID: <span className="font-normal text-gray-600">{order.id}</span></p>
                    <p className="text-sm text-gray-500">
                      Tanggal Pesanan: {order.createdAt?.toDate().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-800 mt-2 md:mt-0">Total: Rp{order.totalPrice.toLocaleString('id-ID')}</p>
                </div>
                
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.productId} className="flex items-center">
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover mr-4 rounded"/>
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-700">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.quantity} x Rp{item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <p className="font-semibold text-gray-700">Rp{(item.quantity * item.price).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white text-center p-12 rounded-lg shadow-md">
            <p className="text-gray-500">Anda belum memiliki riwayat pesanan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
