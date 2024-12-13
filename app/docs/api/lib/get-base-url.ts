export const getBaseUrl = () => {
  if (typeof window === "undefined") return ""
  return `${window.location.protocol}//${window.location.host}`
}
