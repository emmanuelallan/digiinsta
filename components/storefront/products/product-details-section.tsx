"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ProductDetailsSectionProps {
  description: string;
  className?: string;
}

export function ProductDetailsSection({ description, className }: ProductDetailsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse the description to extract sections
  const sections = parseDescriptionSections(description);
  
  // Show first 300 characters when collapsed
  const previewText = getPlainText(description).substring(0, 300);
  const shouldShowReadMore = getPlainText(description).length > 300;

  return (
    <div className={cn("border-t border-gray-200 py-6", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <h2 className="text-lg font-semibold text-gray-900">Item details</h2>
        <HugeiconsIcon
          icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
          size={20}
          className="text-gray-600 group-hover:text-gray-900 transition-colors"
        />
      </button>

      {isExpanded ? (
        <div className="mt-6 space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="space-y-3">
              {section.title && (
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <span>{section.emoji}</span>
                  <span>{section.title}</span>
                </h3>
              )}
              <div
                className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {previewText}
            {shouldShowReadMore && "..."}
          </p>
          {shouldShowReadMore && (
            <button
              onClick={() => setIsExpanded(true)}
              className="mt-3 text-sm font-medium text-gray-900 hover:text-pink-600 transition-colors inline-flex items-center gap-1"
            >
              Read more about this item
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface Section {
  emoji: string;
  title: string;
  content: string;
}

function parseDescriptionSections(html: string): Section[] {
  const sections: Section[] = [];
  
  // Common section patterns
  const patterns = [
    { emoji: "📝", title: "FULL PRODUCT DESCRIPTION", keywords: ["FULL PRODUCT DESCRIPTION", "DESCRIPTION", "ABOUT"] },
    { emoji: "💡", title: "WHAT MAKES THIS SPECIAL", keywords: ["WHAT MAKES THIS SPECIAL", "WHY THIS", "SPECIAL"] },
    { emoji: "📦", title: "WHAT'S INCLUDED", keywords: ["WHAT'S INCLUDED", "INCLUDED", "YOU'LL GET"] },
    { emoji: "🛠️", title: "FILE FORMAT & DELIVERY", keywords: ["FILE FORMAT", "DELIVERY", "FORMAT", "HOW TO USE"] },
  ];

  // Split by common section markers
  const parts = html.split(/(?=📝|💡|📦|🛠️|<h[1-6]|<strong>)/gi);
  
  let currentSection: Section | null = null;

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;

    // Check if this part starts a new section
    let foundSection = false;
    for (const pattern of patterns) {
      const hasKeyword = pattern.keywords.some(keyword => 
        trimmedPart.toUpperCase().includes(keyword)
      );
      
      if (hasKeyword || trimmedPart.startsWith(pattern.emoji)) {
        // Save previous section
        if (currentSection && currentSection.content) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          emoji: pattern.emoji,
          title: pattern.title,
          content: trimmedPart.replace(new RegExp(`${pattern.emoji}\\s*`, 'g'), '')
                            .replace(new RegExp(pattern.keywords.join('|'), 'gi'), '')
                            .trim(),
        };
        foundSection = true;
        break;
      }
    }

    // If no section found, add to current section or create default
    if (!foundSection) {
      if (currentSection) {
        currentSection.content += '\n' + trimmedPart;
      } else {
        currentSection = {
          emoji: "",
          title: "",
          content: trimmedPart,
        };
      }
    }
  }

  // Add last section
  if (currentSection && currentSection.content) {
    sections.push(currentSection);
  }

  // If no sections were found, return the whole description as one section
  if (sections.length === 0) {
    sections.push({
      emoji: "",
      title: "",
      content: html,
    });
  }

  return sections;
}

function getPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/📝|💡|📦|🛠️/g, "")
    .trim();
}
