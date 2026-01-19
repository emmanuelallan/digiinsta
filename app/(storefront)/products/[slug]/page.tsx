// Product detail page - placeholder
export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <div>Product: {params.slug}</div>;
}
