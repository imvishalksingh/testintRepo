import express from "express";
import { sendContactMail } from "../controllers/contactController.js";
import { testEmailEndpoint } from "../controllers/contactController.js";

const router = express.Router();

router.post("/", sendContactMail);
router.get("/", testEmailEndpoint);

export default router;
