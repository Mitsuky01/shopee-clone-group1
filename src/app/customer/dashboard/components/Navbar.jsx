export default function Navbar({ search, setSearch, sort, setSort, category, setCategory, minimal = false }) {
  return (
    <div className="bg-white shadow px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 rounded-lg mb-6">
      <h1 className="text-xl font-bold text-orange-600">ShopeeClone</h1>

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
  )
}
