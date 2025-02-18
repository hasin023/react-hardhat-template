const TxHash = require("../db/models/TxHash")

const getAllTxHashes = async (req, res, next) => {
  try {
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
}

const createTxHash = async (req, res, next) => {
  try {
    const { transactionHash } = req.body

    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        error: "Transaction hash is required",
      })
    }

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
}

module.exports = {
  getAllTxHashes,
  createTxHash,
}
