const { model, models, Schema } = require("mongoose")

const TxHashSchema = new Schema({
  transactionHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const TxHash = models?.TxHash || model("TxHash", TxHashSchema)

module.exports = TxHash
