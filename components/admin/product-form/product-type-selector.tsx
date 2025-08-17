import { Label } from "@/components/ui/label"

interface ProductTypeSelectorProps {
  productType: "single" | "bundle"
  onProductTypeChange: (type: "single" | "bundle") => void
}

export function ProductTypeSelector({ productType, onProductTypeChange }: ProductTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-foreground">Product Type</Label>
      <div className="flex gap-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="productType"
            checked={productType === "single"}
            onChange={() => onProductTypeChange("single")}
            className="text-primary"
          />
          <span className="text-sm">Single Product</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="productType"
            checked={productType === "bundle"}
            onChange={() => onProductTypeChange("bundle")}
            className="text-primary"
          />
          <span className="text-sm">Bundle</span>
        </label>
      </div>
    </div>
  )
}
