export interface Product {
  id: number
  title: string
  category: string
  price: number
  rating: number
  reviews: number
  image: string
  description: string
  tags: string[]
  longDescription?: string
  features?: string[]
  specifications?: Record<string, string>
  gallery?: string[]
}

export const products: Product[] = [
  {
    id: 1,
    title: "Minimalist Desktop Wallpapers",
    category: "Wallpapers",
    price: 12.99,
    rating: 4.9,
    reviews: 234,
    image: "/placeholder.svg?height=300&width=400",
    description: "Clean, modern wallpapers for productivity",
    tags: ["minimalist", "desktop", "productivity", "clean", "modern"],
    longDescription:
      "Transform your workspace with our collection of 50 carefully curated minimalist desktop wallpapers. Each design is crafted to reduce visual clutter and enhance focus, perfect for professionals who value clean aesthetics and productivity.",
    features: [
      "50 high-resolution wallpapers (4K and 5K)",
      "Multiple aspect ratios supported",
      "Instant download after purchase",
      "Commercial use license included",
      "Regular updates with new designs",
    ],
    specifications: {
      Resolution: "4K (3840x2160) and 5K (5120x2880)",
      Format: "PNG and JPG",
      "File Size": "2-8 MB per wallpaper",
      License: "Commercial use allowed",
    },
    gallery: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
  },
  {
    id: 2,
    title: "2024 Productivity Planner",
    category: "Planners",
    price: 19.99,
    rating: 4.8,
    reviews: 156,
    image: "/placeholder.svg?height=300&width=400",
    description: "Complete yearly planning system",
    tags: ["productivity", "planner", "yearly", "goals", "organization"],
    longDescription:
      "Master your year with our comprehensive productivity planner. Designed by productivity experts, this digital planner includes monthly, weekly, and daily layouts to help you achieve your goals and maintain work-life balance.",
    features: [
      "12 monthly planning spreads",
      "52 weekly planning pages",
      "Daily reflection templates",
      "Goal tracking worksheets",
      "Habit tracker included",
      "Compatible with GoodNotes, Notability, and more",
    ],
    specifications: {
      Pages: "365+ pages",
      Format: "PDF (hyperlinked)",
      Size: "A4 and US Letter",
      Compatibility: "iPad, tablet, or printable",
    },
    gallery: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
  },
  {
    id: 3,
    title: "Gratitude Journal Template",
    category: "Journals",
    price: 8.99,
    rating: 4.7,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=400",
    description: "Daily reflection and mindfulness",
    tags: ["gratitude", "journal", "mindfulness", "daily", "reflection"],
    longDescription:
      "Cultivate a positive mindset with our beautifully designed gratitude journal. This template encourages daily reflection and helps you focus on the good in your life, leading to improved mental well-being and happiness.",
    features: [
      "30-day gratitude challenge",
      "Daily gratitude prompts",
      "Weekly reflection pages",
      "Mood tracking elements",
      "Inspirational quotes included",
    ],
    specifications: {
      Pages: "90 pages",
      Format: "PDF",
      Size: "A5 optimized",
      Compatibility: "Digital and printable",
    },
    gallery: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
  },
  {
    id: 4,
    title: "Abstract Art Wallpapers",
    category: "Wallpapers",
    price: 15.99,
    rating: 4.9,
    reviews: 312,
    image: "/placeholder.svg?height=300&width=400",
    description: "Vibrant designs for creative inspiration",
    tags: ["abstract", "art", "creative", "vibrant", "inspiration"],
    longDescription:
      "Ignite your creativity with our stunning collection of abstract art wallpapers. Each piece is an original digital artwork that brings energy and inspiration to your digital workspace.",
    features: [
      "40 unique abstract designs",
      "Vibrant color palettes",
      "Multiple device formats",
      "Artist-created originals",
      "High-resolution quality",
    ],
    specifications: {
      Resolution: "4K and mobile optimized",
      Format: "PNG and JPG",
      Devices: "Desktop, tablet, mobile",
      License: "Personal and commercial use",
    },
    gallery: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
  },
  {
    id: 5,
    title: "Weekly Goal Planner",
    category: "Planners",
    price: 14.99,
    rating: 4.6,
    reviews: 78,
    image: "/placeholder.svg?height=300&width=400",
    description: "Focus on what matters most",
    tags: ["weekly", "goals", "planner", "focus", "priorities"],
    longDescription:
      "Achieve more with focused weekly planning. This planner helps you break down big goals into manageable weekly actions, ensuring consistent progress toward your most important objectives.",
    features: [
      "52 weekly planning templates",
      "Goal breakdown worksheets",
      "Priority matrix included",
      "Progress tracking tools",
      "Reflection prompts",
    ],
    specifications: {
      Pages: "60 pages",
      Format: "PDF (interactive)",
      Size: "A4 and US Letter",
      Compatibility: "Digital planning apps",
    },
    gallery: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
  },
  {
    id: 6,
    title: "Travel Journal Kit",
    category: "Journals",
    price: 22.99,
    rating: 4.8,
    reviews: 145,
    image: "/placeholder.svg?height=300&width=400",
    description: "Document your adventures",
    tags: ["travel", "journal", "adventure", "memories", "documentation"],
    longDescription:
      "Capture every moment of your travels with our comprehensive travel journal kit. Perfect for digital nomads and adventure seekers who want to document their journeys in style.",
    features: [
      "Trip planning templates",
      "Daily travel logs",
      "Photo placement guides",
      "Expense tracking sheets",
      "Memory preservation pages",
      "Packing checklists included",
    ],
    specifications: {
      Pages: "120+ pages",
      Format: "PDF (fillable)",
      Size: "A5 and A4 options",
      Compatibility: "iPad and printable",
    },
    gallery: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
  },
  {
    id: 7,
    title: "Nature Photography Wallpapers",
    category: "Wallpapers",
    price: 18.99,
    rating: 4.9,
    reviews: 267,
    image: "/placeholder.svg?height=300&width=400",
    description: "Stunning landscapes and wildlife",
    tags: ["nature", "photography", "landscape", "wildlife", "outdoor"],
    longDescription:
      "Bring the beauty of nature to your screen with our professional photography collection. Each wallpaper features breathtaking landscapes and wildlife captured by award-winning photographers.",
    features: [
      "60 professional photographs",
      "Diverse nature scenes",
      "Seasonal collections",
      "Ultra-high resolution",
      "Photographer credits included",
    ],
    specifications: {
      Resolution: "6K and 4K options",
      Format: "RAW and JPG",
      Subjects: "Landscapes, wildlife, macro",
      License: "Personal use",
    },
    gallery: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
  },
  {
    id: 8,
    title: "Habit Tracker Journal",
    category: "Journals",
    price: 11.99,
    rating: 4.5,
    reviews: 203,
    image: "/placeholder.svg?height=300&width=400",
    description: "Build better habits consistently",
    tags: ["habit", "tracker", "consistency", "self-improvement", "routine"],
    longDescription:
      "Transform your life one habit at a time with our scientifically-designed habit tracker. Based on behavioral psychology research, this journal makes habit formation simple and sustainable.",
    features: [
      "90-day habit tracking",
      "Multiple tracking methods",
      "Habit stacking guides",
      "Progress visualization",
      "Motivation boosters",
      "Habit science education",
    ],
    specifications: {
      Pages: "100 pages",
      Format: "PDF (interactive)",
      Duration: "90-day program",
      Compatibility: "Digital and print",
    },
    gallery: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
  },
]

export function getProductById(id: number): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getRelatedProducts(currentProduct: Product, limit = 3): Product[] {
  return products
    .filter((product) => product.id !== currentProduct.id && product.category === currentProduct.category)
    .slice(0, limit)
}
