import nodemailer from "nodemailer";

export const sendContactMail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // MUST be false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // app password
      },
      connectionTimeout: 30000,
      socketTimeout: 30000,
      greetingTimeout: 30000,
    });

    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Shri Maheva Mustard Oil Inquiry - ${name}`,
      text: message,
      html: `<p>${message}</p>`,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("GMAIL SMTP ERROR:", error);

    return res.status(504).json({
      success: false,
      error: "Gmail SMTP timeout on Render",
    });
  }
};

export const testEmailEndpoint = async (req, res) => {
  res.json({
    status: "OK",
    emailUserSet: !!process.env.EMAIL_USER,
    emailPassSet: !!process.env.EMAIL_PASS,
    nodeEnv: process.env.NODE_ENV,
  });
};
