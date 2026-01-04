import { type Metadata } from "next";
import { UnsubscribeForm } from "./unsubscribe-form";

export const metadata: Metadata = {
  title: "Unsubscribe | DigiInsta",
  description: "Unsubscribe from DigiInsta emails",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-center text-2xl font-bold">Unsubscribe</h1>
          <p className="mb-8 text-center text-gray-600">
            We&apos;re sorry to see you go. Enter your email to unsubscribe from our mailing list.
          </p>
          <UnsubscribeForm />
        </div>
      </div>
    </main>
  );
}
