import Link from 'next/link'

export default function ProductCard({ product }) {
  if (!product) return null

  return (
    <Link href={`/customer/dashboard/${product.id}`}>
      <div className="bg-white p-4 rounded shadow hover:shadow-lg transition cursor-pointer">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover mb-2 rounded"
        />
        <h3 className="text-sm font-semibold">{product.name}</h3>
        <p className="text-orange-600 font-bold">Rp {product.price.toLocaleString()}</p>
      </div>
    </Link>
  )
}

