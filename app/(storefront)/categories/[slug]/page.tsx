// Category page - placeholder
export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  return <div>Category: {params.slug}</div>;
}
