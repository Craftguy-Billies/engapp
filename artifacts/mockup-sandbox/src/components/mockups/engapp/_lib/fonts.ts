// Inject the Google Fonts link for "Noto Serif TC" once on the client. The
// shared sandbox `index.html` already loads Inter and a wide range of system
// fonts but not Noto Serif TC, which the EngApp design pairs with Inter for
// Traditional Chinese typography.

const HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;500;600;700;900&display=swap";

let injected = false;

export function ensureFonts(): void {
  if (typeof document === "undefined") return;
  if (injected) return;
  if (document.head.querySelector(`link[href="${HREF}"]`)) {
    injected = true;
    return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = HREF;
  document.head.appendChild(link);
  injected = true;
}
