export const getBaseUrl = () => {
  if (typeof window === "undefined") return ""

  try {
    const url = new URL(window.location.href)
    // Remove trailing slash if present
    return url.origin.replace(/\/$/, "")
  } catch (error) {
    console.error("Failed to generate base URL:", error)
    // Fallback to basic concatenation
    return `${window.location.protocol}//${window.location.host}`.replace(
      /\/$/,
      ""
    )
  }
}
