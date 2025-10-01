const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MAILJET_API_KEY = process.env.MAILJET_API_KEY || "";
const MAILJET_API_SECRET = process.env.MAILJET_API_SECRET || "";
const FROM_EMAIL = process.env.MAIL_FROM || "no-reply@example.com";
const FROM_NAME = process.env.MAIL_FROM_NAME || "EventHall";

if (!MAILJET_API_KEY || !MAILJET_API_SECRET) {
  console.warn(
    "Mailjet API key/secret not set. Emails will fail until they are set in environment variables."
  );
}

app.post("/api/send-reminder", async (req, res) => {
  try {
    const { toEmail, toName, eventTitle, eventDate, eventLink } = req.body;

    if (!toEmail) return res.status(400).json({ error: "toEmail is required" });

    const apiUrl = "https://api.mailjet.com/v3.1/send";

    const body = {
      Messages: [
        {
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
          To: [{ Email: toEmail, Name: toName || toEmail }],
          Subject: `Reminder: ${eventTitle}`,
          TextPart: `Hi ${
            toName || ""
          },\n\nThis is a reminder for the event: ${eventTitle} on ${eventDate}.\n${
            eventLink ? `More info: ${eventLink}` : ""
          }\n\nSee you there!`,
          HTMLPart: `<p>Hi ${
            toName || ""
          },</p><p>This is a reminder for the event: <strong>${eventTitle}</strong> on <em>${eventDate}</em>.</p>${
            eventLink
              ? `<p><a href="${eventLink}" target="_blank">View event</a></p>`
              : ""
          }<p>See you there!</p>`,
        },
      ],
    };

    const auth = Buffer.from(
      `${MAILJET_API_KEY}:${MAILJET_API_SECRET}`
    ).toString("base64");

    const r = await global.fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("Mailjet error", data);
      return res
        .status(500)
        .json({ error: "Failed to send email", details: data });
    }

    res.json({ ok: true, data });
  } catch (error) {
    console.error("Send reminder error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const port = process.env.PORT || 5050;
app.listen(port, () =>
  console.log(`Mail server listening on http://localhost:${port}`)
);
