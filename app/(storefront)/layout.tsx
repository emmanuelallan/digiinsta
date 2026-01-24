import { Header } from "@/components/storefront/shared/header";
import { Footer } from "@/components/storefront/shared/footer";
import TopBar from "@/components/storefront/top-bar";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
