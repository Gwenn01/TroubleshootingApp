import type { Ionicons } from "@expo/vector-icons";

// Known dataset folder/category names -> icon. Anything not listed here
// falls back to DEFAULT_CATEGORY_ICON, so new categories (e.g. an "erp"
// folder you drop in later) still work without a code change.
export const CATEGORY_ICONS: Partial<
  Record<string, keyof typeof Ionicons.glyphMap>
> = {
  networking: "wifi-outline",
  printer: "print-outline",
  shared_folder: "folder-open-outline",
  lotus_notes: "mail-outline",
  microsoft_office: "document-text-outline",
  hardware: "hardware-chip-outline",
  software: "apps-outline",
  system: "settings-outline",
  windows: "logo-windows",
  keyboard_mouse: "keypad-outline",
  drivers: "construct-outline",
  general: "help-circle-outline",
};

export const DEFAULT_CATEGORY_ICON: keyof typeof Ionicons.glyphMap =
  "help-circle-outline";

export function iconForCategory(
  category: string,
): keyof typeof Ionicons.glyphMap {
  return CATEGORY_ICONS[category.toLowerCase()] ?? DEFAULT_CATEGORY_ICON;
}

// Short one-line taglines shown on category cards. This is UI copy, not
// dataset content — nothing here is a troubleshooting fact, so it's safe
// to hand-write for known categories. Anything not listed falls back to
// a generated line below.
const CATEGORY_BLURBS: Partial<Record<string, string>> = {
  networking: "Internet, Wi-Fi, and network connection problems.",
  printer: "Printer offline, driver, and print queue problems.",
  shared_folder: "Shared drive and file access problems.",
  lotus_notes: "Lotus Notes mail and client problems.",
  microsoft_office: "Word, Excel, Outlook, and Office app problems.",
  hardware: "Devices, monitors, and physical equipment problems.",
  software: "Application installs, crashes, and general software problems.",
  system: "Windows system settings and configuration problems.",
  windows: "Windows startup, updates, and common errors.",
  keyboard_mouse: "Keyboard and mouse input problems.",
  drivers: "Device driver installation and update problems.",
  general: "General IT problems that don't fit another category.",
};

/** Falls back to a generated line for any category not in the map above. */
export function blurbForCategory(category: string): string {
  return (
    CATEGORY_BLURBS[category.toLowerCase()] ??
    `Troubleshooting guides for ${category}.`
  );
}

function toTitleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * "shared_folder" -> "Shared Folder", "networking" -> "Networking".
 * Dataset category/subcategory values are often lowercase/snake_case
 * (folder-derived defaults) — this makes them read as normal UI labels.
 */
export function displayCategoryName(category: string): string {
  return toTitleCase(category);
}
