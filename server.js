require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

app.use(
  cors({
    origin: [
      "https://lepasjuang.smktibazma.sch.id",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://belepasjuang.smktibazma.sch.id" // untuk development React Vite
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/api/wishes", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM wishes ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error("ERROR GET WISHES:", error);

    res.status(500).json({
      message: "Gagal mengambil data",
      error: error.message
    });
  }
});

app.post("/api/wishes", async (req, res) => {
  try {
    const { name, major, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        message: "Nama dan pesan wajib diisi",
      });
    }

    const initial = name.trim().charAt(0).toUpperCase();

    const [result] = await db.query(
      `INSERT INTO wishes (name, major, message, initial)
       VALUES (?, ?, ?, ?)`,
      [
        name,
        major || "Alumni / Tamu",
        message,
        initial,
      ]
    );

    const [newWish] = await db.query(
      "SELECT * FROM wishes WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newWish[0]);
  } catch (error) {
    res.status(500).json({ message: "Gagal menyimpan ucapan" });
  }
});

app.get("/api/invitations/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM invitations WHERE slug=?",
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Undangan tidak ditemukan"
      });
    }

    res.json(rows[0]);

  } catch(error) {
    res.status(500).json(error);
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});