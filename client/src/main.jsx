import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { Toaster } from "react-hot-toast"

import { BrowserRouter, Routes, Route } from "react-router"
import DApp from "./pages/DApp"
import TxDetails from "./components/TxDetails"
import NotFound from "./components/NotFound"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<DApp />} />
        <Route path='/tx/:txHash' element={<TxDetails />} />

        <Route path='*' element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </StrictMode>
)
