import ProductDetailPage from '../components/ProductDetailPage'

export default function Page({ params }) {
  return <ProductDetailPage id={params.id} />
}
