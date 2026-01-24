"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type TaxonomyType = 'product_type' | 'format' | 'occasion' | 'collection'

export interface TaxonomyOption {
  id: string
  title: string
}

export interface TaxonomySelectorProps {
  type: TaxonomyType
  label: string
  value: string | string[]
  onChange: (value: string | string[]) => void
  options: TaxonomyOption[]
  multiple?: boolean
  onAddNew: () => void
  className?: string
}

const taxonomyLabels: Record<TaxonomyType, string> = {
  product_type: 'Product Type',
  format: 'Formats',
  occasion: 'Occasion',
  collection: 'Collection'
}

export function TaxonomySelector({
  type,
  label,
  value,
  onChange,
  options,
  multiple = false,
  onAddNew,
  className
}: TaxonomySelectorProps) {
  const [selectedValues, setSelectedValues] = React.useState<Set<string>>(
    new Set(Array.isArray(value) ? value : value ? [value] : [])
  )

  // Sync internal state with prop changes
  React.useEffect(() => {
    const newSet = new Set(Array.isArray(value) ? value : value ? [value] : [])
    setSelectedValues(newSet)
  }, [value])

  const handleValueChange = (newValue: string) => {
    if (multiple) {
      const newSet = new Set(selectedValues)
      if (newSet.has(newValue)) {
        newSet.delete(newValue)
      } else {
        newSet.add(newValue)
      }
      setSelectedValues(newSet)
      onChange(Array.from(newSet))
    } else {
      onChange(newValue)
    }
  }

  // Ensure we have a valid value for the Select component
  const selectValue = React.useMemo(() => {
    if (multiple) return undefined
    
    // Only return value if it exists in options
    const stringValue = value as string
    if (!stringValue) return undefined
    
    const exists = options.some(opt => opt.id === stringValue)
    return exists ? stringValue : undefined
  }, [multiple, value, options])

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={`taxonomy-${type}`}>
        {label || taxonomyLabels[type]}
      </Label>
      <div className="flex gap-2 items-center">
        <Select
          value={selectValue}
          onValueChange={handleValueChange}
        >
          <SelectTrigger 
            id={`taxonomy-${type}`}
            className="flex-1"
          >
            <SelectValue placeholder={`Select ${label || taxonomyLabels[type]}`} />
          </SelectTrigger>
          <SelectContent>
            {options.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <SelectItem 
                  key={option.id} 
                  value={option.id}
                >
                  {multiple && selectedValues.has(option.id) && "✓ "}
                  {option.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddNew}
          title={`Add new ${label || taxonomyLabels[type]}`}
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
        </Button>
      </div>
      {multiple && selectedValues.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Array.from(selectedValues).map((id) => {
            const option = options.find(opt => opt.id === id)
            return option ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-md"
              >
                {option.title}
                <button
                  type="button"
                  onClick={() => handleValueChange(id)}
                  className="hover:text-destructive"
                  aria-label={`Remove ${option.title}`}
                >
                  ×
                </button>
              </span>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
