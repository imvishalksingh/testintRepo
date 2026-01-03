import nodemailer from "nodemailer";

export const sendContactMail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
    });

    const mailOptions = {
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Shri Maheva Mustard Oil Inquiry - ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif">
          <h2>New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f5f5f5;padding:15px">
            ${message.replace(/\n/g, "<br/>")}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    let status = 500;
    let msg = "Failed to send email";

    if (error.code === "EAUTH") {
      msg = "Email authentication failed";
    } else if (error.code === "ESOCKET") {
      msg = "Email server connection failed";
    } else if (error.message?.includes("timeout")) {
      status = 504;
      msg = "Email service timeout";
    }

    res.status(status).json({
      success: false,
      error: msg,
    });
  }
};

export const testEmailEndpoint = async (req, res) => {
  res.status(200).json({
    status: "OK",
    emailUserSet: !!process.env.EMAIL_USER,
    emailPassSet: !!process.env.EMAIL_PASS,
    nodeEnv: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
};
