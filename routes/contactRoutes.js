import express from "express";
import {
  sendContactMail,
  testEmailEndpoint,
} from "../controllers/contactController.js";

const router = express.Router();

router.post("/send", sendContactMail);
router.get("/test", testEmailEndpoint);

export default router;
