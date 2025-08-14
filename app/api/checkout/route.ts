import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const productId: string | undefined = body?.productId

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const apiKey = process.env.LEMON_SQUEEZY_API_KEY
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID

    if (!apiKey || !storeId) {
      return NextResponse.json({ error: "Missing Lemon Squeezy configuration" }, { status: 500 })
    }

    // Lookup product in Supabase to get lemon_product_id
    const supabase = await createClient()

    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("id, title, lemon_product_id")
      .eq("id", productId)
      .maybeSingle()

    if (productErr) {
      return NextResponse.json({ error: productErr.message }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const lemonProductId = product.lemon_product_id

    // Fetch variant for the Lemon product
    const variantsRes = await fetch(
      `https://api.lemonsqueezy.com/v1/variants?filter[product_id]=${encodeURIComponent(lemonProductId)}`,
      {
        headers: {
          Accept: "application/vnd.api+json",
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      },
    )

    if (!variantsRes.ok) {
      const text = await variantsRes.text()
      return NextResponse.json({ error: `Failed to fetch variants: ${text}` }, { status: 502 })
    }

    const variantsJson = await variantsRes.json()
    const variant = Array.isArray(variantsJson?.data) ? variantsJson.data[0] : null

    if (!variant?.id) {
      return NextResponse.json({ error: "No variant found for product" }, { status: 400 })
    }

    const variantId = String(variant.id)

    const origin = request.nextUrl.origin

    // Create checkout
    const checkoutPayload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            button_color: "#7047EB",
          },
          product_options: {
            redirect_url: `${origin}/checkout/success`,
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: String(storeId),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }

    const checkoutRes = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(checkoutPayload),
    })

    if (!checkoutRes.ok) {
      const text = await checkoutRes.text()
      return NextResponse.json({ error: `Failed to create checkout: ${text}` }, { status: 502 })
    }

    const checkoutJson = await checkoutRes.json()
    const url: string | undefined = checkoutJson?.data?.attributes?.url

    if (!url) {
      return NextResponse.json({ error: "Checkout URL not returned" }, { status: 502 })
    }

    // Respond with the URL; client can redirect
    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
