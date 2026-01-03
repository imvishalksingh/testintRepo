import nodemailer from "nodemailer";

import nodemailer from "nodemailer";

export const sendContactMail = async (req, res) => {
  console.log("sendContactMail called with:", { 
    name: req.body.name, 
    email: req.body.email,
    hasMessage: !!req.body.message 
  });

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    console.log("Validation failed - missing fields");
    return res.status(400).json({ error: "All fields are required" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Invalid email format:", email);
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Set timeout for the entire operation (10 seconds)
  const timeout = 10000;
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Email sending timeout after 10 seconds"));
    }, timeout);
  });

  try {
    console.log("Setting up transporter...");
    console.log("Using email user:", process.env.EMAIL_USER ? "Set" : "Not set");
    
    // Try multiple configurations
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Important settings for Render/Server
      pool: true,
      maxConnections: 1,
      maxMessages: 5,
      rateDelta: 1000,
      rateLimit: 5,
      // Connection timeout
      connectionTimeout: 5000,
      // Socket timeout
      socketTimeout: 10000,
      // Disable TLS certificate validation (might be needed on Render)
      tls: {
        rejectUnauthorized: false
      },
      // Debug mode
      debug: process.env.NODE_ENV !== 'production',
      logger: process.env.NODE_ENV !== 'production'
    });

    // Verify connection with timeout
    console.log("Verifying connection...");
    const verifyPromise = transporter.verify().then(() => {
      console.log("SMTP connection verified successfully");
    });

    await Promise.race([verifyPromise, timeoutPromise]);

    // Mail options
    const mailOptions = {
      from: `"Website Contact Form" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.EMAIL_USER,
      subject: `Shri Maheva Mustard Oil Inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>New Inquiry - Shri Maheva Mustard Oil</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #ccc;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent from website contact form at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    console.log("Attempting to send email...");
    
    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions).then((info) => {
      console.log("Email sent successfully. Message ID:", info.messageId);
      console.log("Response:", info.response);
      return info;
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);
    
    // Clear timeout since we succeeded
    clearTimeout(timeoutId);

    res.status(200).json({ 
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Clear timeout on error
    if (timeoutId) clearTimeout(timeoutId);
    
    console.error("EMAIL ERROR DETAILS:", {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // More detailed error responses
    let userMessage = "Failed to send email";
    let statusCode = 500;
    
    if (error.message.includes("timeout")) {
      userMessage = "Email service timeout. Please try again.";
      statusCode = 504;
    } else if (error.code === 'EAUTH') {
      userMessage = "Email configuration error. Please contact support.";
      console.error("AUTH ERROR - Check EMAIL_USER and EMAIL_PASS env vars");
    } else if (error.code === 'ESOCKET') {
      userMessage = "Cannot connect to email server.";
    }

    res.status(statusCode).json({ 
      success: false,
      error: userMessage,
      // Include debug info only in non-production
      ...(process.env.NODE_ENV !== 'production' && {
        debug: {
          error: error.message,
          code: error.code
        }
      })
    });
  }
};

// test-email.js or a test route
export const testEmailEndpoint = async (req, res) => {
  try {
    console.log("Test endpoint hit");
    console.log("EMAIL_USER exists:", !!process.env.EMAIL_USER);
    console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
    
    // Quick response to test if endpoint is reachable
    res.status(200).json({ 
      status: "Endpoint working",
      envVars: {
        emailUserSet: !!process.env.EMAIL_USER,
        emailPassSet: !!process.env.EMAIL_PASS,
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({ error: error.message });
  }
};