import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://shreemehoba.vercel.app",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// routes
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
