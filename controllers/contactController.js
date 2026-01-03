import nodemailer from "nodemailer";

export const sendContactMail = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    // 1️⃣ transporter setup with explicit settings
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // or 465 for SSL
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Add this for Render/Railway
      },
    });

    // Verify connection configuration
    await transporter.verify();

    // 2️⃣ mail options
    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`, // Use your email as sender
      replyTo: email, // User's email as reply-to
      to: process.env.EMAIL_USER,
      subject: "Shri Maheva Mustard Oil Inquiry",
      text: `You received a new message from ${name} (${email}): \n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>New Inquiry Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This email was sent from your website contact form.
          </p>
        </div>
      `,
    };

    // 3️⃣ send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    res.status(200).json({ 
      message: "Email sent successfully",
      messageId: info.messageId 
    });
  } catch (error) {
    console.error("Mail Error Details:", error);
    
    // More specific error messages
    let errorMessage = "Failed to send email";
    if (error.code === 'EAUTH') {
      errorMessage = "Authentication failed. Check your email credentials.";
    } else if (error.code === 'ECONNECTION') {
      errorMessage = "Connection to email server failed.";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Email server connection timeout.";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};