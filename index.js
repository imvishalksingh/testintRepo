import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();   //  correct for deployment

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "https://shreemehoba.vercel.app" }));
app.use(express.json());

// contact route
app.use("/api/contact", contactRoutes);
app.use("/api/test-email", contactRoutes);

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
