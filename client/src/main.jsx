import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import DApp from "./DApp"
import { Toaster } from "react-hot-toast"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DApp />
    <Toaster />
  </StrictMode>
)
