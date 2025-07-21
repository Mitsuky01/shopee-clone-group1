'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/utils/firebase'
import Navbar from './components/Navbar'
import ProductCard from './components/ProductCard'

export default function DashboardPage() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [category, setCategory] = useState('all')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const auth = getAuth()
    setUser(auth.currentUser)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, 'products'))
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProducts(data)
    }

    if (user) fetchProducts()
  }, [user])

  useEffect(() => {
    let result = [...products]

    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category !== 'all') {
      result = result.filter(p => p.category === category)
    }

    if (sort === 'low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sort === 'high') {
      result.sort((a, b) => b.price - a.price)
    }

    setFiltered(result)
  }, [products, search, sort, category])

  if (!user) {
    return <div className="p-6 text-center">Please log in to access the dashboard.</div>
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <Navbar
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        category={category}
        setCategory={setCategory}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  )
}
