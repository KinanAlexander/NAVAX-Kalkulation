"use client"

import React from "react"
import {
  FormField,
  SearchInput,
  ToggleButtonGroup,
  FileUpload,
} from "@/components/ds"
import { Input } from "@/components/ui/input"
import { LayoutGrid, List, Columns3 } from "lucide-react"

export function ShowcaseForms() {
  const [search, setSearch] = React.useState("Dashboard")
  const [view, setView] = React.useState("grid")

  return (
    <div className="flex flex-col gap-8">
      {/* Form Field */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Form Field</p>
        <div className="flex flex-col gap-4 max-w-md">
          <FormField
            label="Email"
            htmlFor="ff-email"
            description="We'll never share your email."
            required
          >
            <Input id="ff-email" type="email" placeholder="you@example.com" />
          </FormField>
          <FormField
            label="Username"
            htmlFor="ff-user"
            error="Username is already taken."
            required
          >
            <Input
              id="ff-user"
              placeholder="johndoe"
              defaultValue="admin"
              className="border-destructive focus-visible:ring-destructive"
            />
          </FormField>
        </div>
      </div>

      {/* Search Input */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">Search Input</p>
        <div className="max-w-sm">
          <SearchInput
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>
      </div>

      {/* Toggle Button Group */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">
          Toggle Button Group
        </p>
        <div className="flex flex-col gap-3">
          <ToggleButtonGroup
            value={view}
            onValueChange={setView}
            items={[
              { label: "Grid", value: "grid", icon: <LayoutGrid /> },
              { label: "List", value: "list", icon: <List /> },
              { label: "Board", value: "board", icon: <Columns3 /> },
            ]}
          />
          <ToggleButtonGroup
            size="sm"
            value={view}
            onValueChange={setView}
            items={[
              { label: "Grid", value: "grid" },
              { label: "List", value: "list" },
              { label: "Board", value: "board" },
            ]}
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <p className="text-sm font-medium mb-3 text-foreground">File Upload</p>
        <div className="max-w-md">
          <FileUpload
            accept="image/*,.pdf"
            label="Upload a file"
            description="PNG, JPG, or PDF up to 10MB"
          />
        </div>
      </div>
    </div>
  )
}
