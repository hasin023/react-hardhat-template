const express = require("express")
const router = express.Router()

const {
  getAllTxHashes,
  createTxHash,
} = require("../controllers/txHashController")

router.get("/", getAllTxHashes)
router.post("/", createTxHash)

module.exports = router
