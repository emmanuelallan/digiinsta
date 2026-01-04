"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  Location01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type FormStatus = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to send message");
      }

      setFormStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setFormStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Contact</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 py-16 lg:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-white/90">
              Have a question or need help? We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-foreground text-2xl font-bold">Contact Information</h2>
              <p className="text-muted-foreground mt-4">
                Fill out the form and we&apos;ll get back to you as soon as possible.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <HugeiconsIcon icon={Mail01Icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">Email</h3>
                    <p className="text-muted-foreground mt-1 text-sm">support@digiinsta.store</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <HugeiconsIcon icon={Clock01Icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">Response Time</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <HugeiconsIcon icon={Location01Icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">Location</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      We&apos;re a fully remote team serving customers worldwide
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="bg-muted/50 mt-8 rounded-lg p-6">
                <h3 className="text-foreground font-medium">Looking for quick answers?</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Check out our FAQ page for answers to common questions.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/help/faq">View FAQ</Link>
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-xl border p-6 sm:p-8">
              {formStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      size={32}
                      className="text-emerald-500"
                    />
                  </div>
                  <h3 className="text-foreground text-xl font-semibold">Message Sent!</h3>
                  <p className="text-muted-foreground mt-2">
                    Thank you for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <Button className="mt-6" onClick={() => setFormStatus("idle")}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        required
                        disabled={formStatus === "loading"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        disabled={formStatus === "loading"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help?"
                      required
                      disabled={formStatus === "loading"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your question or issue..."
                      rows={5}
                      required
                      disabled={formStatus === "loading"}
                    />
                  </div>

                  {formStatus === "error" && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                      <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                      {errorMessage || "Failed to send message. Please try again."}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={formStatus === "loading"}>
                    {formStatus === "loading" ? (
                      <>
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          size={18}
                          className="mr-2 animate-spin"
                        />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
