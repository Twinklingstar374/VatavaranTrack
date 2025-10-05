const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const app = express(); // ✅ FIRST create Express app

// ===== BULLETPROOF CORS =====
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // frontend
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // preflight request handled
  }

  next();
});

// ✅ Optional: keep cors() as fallback
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse JSON
app.use(express.json());

const prisma = new PrismaClient();
const JWT_SECRET = "YOUR_SECRET_KEY";

// ===== your routes go here =====


// ✅ Fix: Add full CORS + preflight handling
// app.use(cors({
//   origin: "http://localhost:3000",
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));
// app.options("*", cors()); // this line makes browsers happy 💫

// app.use(express.json());

// ===== SIGNUP =====
app.post("/signup", async (req, res) => {
  const { name, password, role, supervisorId } = req.body;

  try {
    const existingUser = await prisma.staff.findUnique({ where: { name } });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const user = await prisma.staff.create({
      data: { name, password, role, supervisorId: supervisorId || null },
    });

    res.json({ message: "User created", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await prisma.staff.findUnique({ where: { name } });
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.password !== password)
      return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, role: user.role, supervisorId: user.supervisorId || null },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== PROTECTED TEST API =====
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

app.listen(5001, () => console.log("✅ Server running on http://localhost:5001"));
