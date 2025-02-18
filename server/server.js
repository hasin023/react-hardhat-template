const express = require("express")
const cors = require("cors")
require("dotenv").config()

const dbConnect = require("./db/connect")
const corsOptions = require("./config/corsConfig")
const errorHandler = require("./middleware/errorHandler")
const txHashRoutes = require("./routes/txHashRoutes")

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))

// Routes
app.use("/api/txhashes", txHashRoutes)

// Error handler
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    await dbConnect()
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
