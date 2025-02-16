const express = require("express")
const cors = require("cors")
const dbConnect = require("./db/connect")
const TxHash = require("./db/models/TxHash")
require("dotenv").config()

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  })
}

// API Routes
// GET: Fetch all transaction hashes with pagination
app.get("/api/txhashes", async (req, res, next) => {
  try {
    await dbConnect()

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const txHashes = await TxHash.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)

    const total = await TxHash.countDocuments()

    res.json({
      success: true,
      data: txHashes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    })
  } catch (error) {
    next(error)
  }
})

// POST: Add a new transaction hash with validation
app.post("/api/txhashes", async (req, res, next) => {
  try {
    await dbConnect() // Ensure DB connection before operation

    const { transactionHash } = req.body

    // Validation
    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        error: "Transaction hash is required",
      })
    }

    // Check for duplicate
    const existing = await TxHash.findOne({ transactionHash })
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Transaction hash already exists",
      })
    }

    const newTxHash = new TxHash({ transactionHash })
    await newTxHash.save()

    res.status(201).json({
      success: true,
      data: newTxHash,
    })
  } catch (error) {
    next(error)
  }
})

// Use error handler
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    // Initial DB connection
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
