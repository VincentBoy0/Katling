"use client"

import type React from "react"
import { useState } from "react"
import { contentTypeDefinitions, type ContentType } from "@/lib/content-types"
import { Plus, X } from "lucide-react"

interface CategoryFormProps {
  category: ContentType
  onSubmit: (data: Record<string, any>) => void
  isLoading?: boolean
}

export default function CategoryForm({ category, onSubmit, isLoading = false }: CategoryFormProps) {
  const config = contentTypeDefinitions[category]
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [arrayFields, setArrayFields] = useState<Record<string, string[]>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }))
  }

  const addArrayItem = (fieldName: string) => {
    setArrayFields((prev) => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), ""],
    }))
  }

  const updateArrayItem = (fieldName: string, index: number, value: string) => {
    setArrayFields((prev) => {
      const updated = [...(prev[fieldName] || [])]
      updated[index] = value
      return { ...prev, [fieldName]: updated }
    })
  }

  const removeArrayItem = (fieldName: string, index: number) => {
    setArrayFields((prev) => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Merge array fields with regular form data
    const finalData = { ...formData }
    Object.entries(arrayFields).forEach(([key, values]) => {
      if (values.length > 0) {
        finalData[key] = values.filter((v) => v.trim())
      }
    })
    onSubmit(finalData)
  }

  const isArrayField = (fieldName: string) => {
    // Fields that should support multiple entries
    return [
      "examples",
      "exampleWords",
      "resources",
      "questions",
      "answers",
      "objectives",
      "sections",
      "activities",
      "usefulPhrases",
    ].includes(fieldName)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {config.fields.map((field) => (
          <div key={field.name} className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
              {field.label}
              {field.label.includes("*") && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === "text" && !isArrayField(field.name) && (
              <input
                type="text"
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            )}

            {field.type === "textarea" && (
              <textarea
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                rows={5}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              />
            )}

            {field.type === "select" && (
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Select an option</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "file" && (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-all">
                <input
                  type="file"
                  name={field.name}
                  onChange={handleFileChange}
                  className="hidden"
                  id={field.name}
                  accept={field.accept}
                />
                <label htmlFor={field.name} className="cursor-pointer block">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-foreground font-semibold">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">{field.accept}</p>
                  {formData[field.name] && (
                    <p className="text-sm text-primary mt-3 font-semibold bg-primary/10 inline-block px-3 py-1 rounded">
                      ✓ {formData[field.name].name}
                    </p>
                  )}
                </label>
              </div>
            )}

            {isArrayField(field.name) && (
              <div className="space-y-3">
                {(arrayFields[field.name] || []).map((value, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateArrayItem(field.name, index, e.target.value)}
                      placeholder={`Item ${index + 1}`}
                      className="flex-1 bg-muted border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(field.name, index)}
                      className="px-3 py-2 bg-red-500/20 text-red-600 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(field.name)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add {field.label.toLowerCase().replace("*", "").trim()}
                </button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">{field.placeholder}</p>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Uploading..." : `Upload ${config.name} Content`}
      </button>
    </form>
  )
}
