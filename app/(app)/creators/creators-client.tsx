"use client";

/**
 * Creators Client Component
 *
 * Handles the interactive parts of the creators page including
 * report link generation and copying.
 *
 * Requirements: 4.4
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Link2, Loader2, User, Mail, ExternalLink } from "lucide-react";
import type { Creator } from "./page";

interface CreatorsClientProps {
  creators: Creator[];
}

interface GeneratedLink {
  creatorId: string;
  token: string;
  url: string;
  expiresAt: string;
}

export function CreatorsClient({ creators }: CreatorsClientProps) {
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<Map<string, GeneratedLink>>(new Map());

  const generateReportLink = useCallback(async (creatorId: string) => {
    setGeneratingFor(creatorId);

    try {
      const response = await fetch("/api/creators/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorSanityId: creatorId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate report link");
      }

      const data = await response.json();

      const link: GeneratedLink = {
        creatorId,
        token: data.token,
        url: data.reportUrl,
        expiresAt: data.expiresAt,
      };

      setGeneratedLinks((prev) => new Map(prev).set(creatorId, link));
      toast.success("Report link generated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate link";
      toast.error(message);
    } finally {
      setGeneratingFor(null);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  const formatExpirationDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (creators.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-center">
            No active creators found. Add creators in Sanity Studio.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {creators.map((creator) => {
        const generatedLink = generatedLinks.get(creator._id);
        const isGenerating = generatingFor === creator._id;

        return (
          <Card key={creator._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {creator.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {creator.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {creator.bio && (
                <p className="text-muted-foreground line-clamp-2 text-sm">{creator.bio}</p>
              )}

              {generatedLink ? (
                <div className="space-y-3">
                  <div className="bg-muted rounded-md p-3">
                    <p className="text-muted-foreground mb-1 text-xs font-medium">Report Link</p>
                    <p className="font-mono text-xs break-all">{generatedLink.url}</p>
                  </div>

                  <p className="text-muted-foreground text-xs">
                    Expires: {formatExpirationDate(generatedLink.expiresAt)}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => copyToClipboard(generatedLink.url)}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={generatedLink.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Open
                      </a>
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => generateReportLink(creator._id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-1 h-3 w-3" />
                        Generate New Link
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => generateReportLink(creator._id)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Generate Report Link
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
