const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend
    methods: ["GET", "POST"], // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Specify allowed headers
  },
  {
    origin: "https://rinithamin.in/", 
    methods: ["GET", "POST"], 
    allowedHeaders: ["Content-Type"]
  })
);
app.use(express.json());
app.use("/", router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server Running"));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per windowMs
  message: { error: true, message: "Too many requests from this IP, please try again later.", statusCode: 429 },
  handler: (req, res) => {
    // Return a structured JSON response when the rate limit is exceeded
    res.status(429).json({
      error: true,
      message: "Too many requests from this IP, please try again later.",
      code: 429
    });
  },
});

require("dotenv").config();
const contactEmail = nodemailer.createTransport({
  service: "gmail", // Replace with your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send");
  }
});

router.post("/contact", limiter, (req, res) => {
  const name = req.body.firstName + " " + req.body.lastName;
  const email = req.body.email;
  const message = req.body.message;

  const mail = {
    from: name,
    to: "rinith.aminsfdc@gmail.com", // Replace with your recipient email
    subject: "Contact Form Submission - Portfolio",
    html: `<p>Name: ${name}</p>
           <p>Email: ${email}</p>
           <p>Message: ${message}</p>`,
  };

  contactEmail.sendMail(mail, (error) => {
    if (error) {
      console.error(error);
      res.json({ code: 500, status: "Error sending message" });
    } else {
      res.json({ code: 200, status: "Message Sent" });
    }
  });
});
