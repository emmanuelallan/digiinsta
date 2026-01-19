// Bundle detail page - placeholder
export default function BundleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <div>Bundle: {params.slug}</div>;
}
