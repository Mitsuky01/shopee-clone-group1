import Link from 'next/link';

export default function Navbar({ search, setSearch, sort, setSort, category, setCategory, minimal = false }) {
  return (
    <div className="bg-white shadow px-6 py-4 flex items-center justify-between gap-4 rounded-lg mb-6">
      
      {/* Bagian Kiri & Tengah: Logo, Pencarian, dan Filter */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-orange-600 flex-shrink-0">
          ShopeeClone
        </Link>

        {/* Form Pencarian & Filter (hanya muncul jika tidak minimal) */}
        {!minimal && (
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <input
              type="text"
              placeholder="Cari produk..."
              className="px-3 py-2 border rounded-md w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="default">Urutkan</option>
              <option value="low">Harga Terendah</option>
              <option value="high">Harga Tertinggi</option>
            </select>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Semua Kategori</option>
              <option value="Pakaian">Pakaian</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Makanan">Makanan</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <Link href="/cart" title="Keranjang Belanja">
          <i className="fas fa-shopping-cart text-2xl text-gray-700 hover:text-orange-500 transition-colors cursor-pointer"></i>
        </Link>
        
        <Link href="/order-history" title="Riwayat Pesanan">
          <i className="fas fa-history text-2xl text-gray-700 hover:text-orange-500 transition-colors cursor-pointer"></i>
        </Link>
      </div>
    </div>
  )
}
