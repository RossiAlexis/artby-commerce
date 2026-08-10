"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Rendered per design, intentionally inert: no i18n, multi-currency, or
 * gift-wrapping logic is wired up behind these controls yet.
 */
export function ArtworkOptions() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Tabs defaultValue="es">
        <TabsList>
          <TabsTrigger value="es">ES</TabsTrigger>
          <TabsTrigger value="en">EN</TabsTrigger>
        </TabsList>
      </Tabs>
      <Select defaultValue="usd">
        <SelectTrigger aria-label="Moneda">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="usd">USD</SelectItem>
        </SelectContent>
      </Select>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox />
        Es un regalo
      </label>
    </div>
  );
}
