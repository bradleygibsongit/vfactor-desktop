import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { bootstrapAppearance } from "@/features/shared/appearance"
import { TooltipProvider } from "@/features/shared/components/ui/tooltip"

// Disable tab-key focus cycling globally
window.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault()
  }
})

async function startApp() {
  await bootstrapAppearance()

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </StrictMode>
  )
}

void startApp()
