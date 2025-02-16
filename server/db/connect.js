const mongoose = require("mongoose")
require("dotenv").config()

var connection = {}

async function dbConnect() {
  if (connection.isConnected) {
    return
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("Add Mongo URI to .env.local")
  }
  const db = await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DBNAME,
  })

  connection.isConnected = db.connections[0]?.readyState
}

module.exports = dbConnect
