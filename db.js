const { Pool } = require("pg")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
})

pool.connect()
  .then(client => {
    console.log("✅ PostgreSQL terkoneksi")
    client.release()
  })
  .catch(err => {
    console.error("❌ Gagal konek DB:", err.message)
  })

module.exports = pool