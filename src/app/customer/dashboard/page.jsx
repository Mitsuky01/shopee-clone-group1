'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import Navbar from './components/Navbar'
import ProductCard from './components/ProductCard'

export default function DashboardPage() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, 'products'))
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProducts(data)
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    let result = [...products]

    // Search
    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Category filter
    if (category !== 'all') {
      result = result.filter(p => p.category === category)
    }

    // Sort
    if (sort === 'low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sort === 'high') {
      result.sort((a, b) => b.price - a.price)
    }

    setFiltered(result)
  }, [products, search, sort, category])

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
