const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MAILJET_API_KEY = process.env.MAILJET_API_KEY || "";
const MAILJET_API_SECRET = process.env.MAILJET_API_SECRET || "";
const FROM_EMAIL = process.env.MAIL_FROM || "adeldevs87@gmail.com";
const FROM_NAME = process.env.MAIL_FROM_NAME || "EventHall";

if (!MAILJET_API_KEY || !MAILJET_API_SECRET) {
  console.warn(
    "Mailjet API key/secret not set. Emails will fail until they are set in environment variables."
  );
}

app.post("/api/send-reminder", async (req, res) => {
  try {
    const { toEmail, toName, eventTitle, eventDateISO, eventLink } = req.body;

    if (!toEmail) return res.status(400).json({ error: "toEmail is required" });
    if (!eventDateISO)
      return res.status(400).json({ error: "eventDateISO is required" });

    // Persist reminder to disk. Background worker will send it 24h before event
    const reminder = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      toEmail,
      toName: toName || "",
      eventTitle,
      eventDateISO,
      eventLink: eventLink || "",
      createdAt: new Date().toISOString(),
      sent: false,
    };

    // ensure data directory and file
    const path = require("path");
    const fs = require("fs");
    const dataDir = path.join(__dirname, "data");
    const filePath = path.join(dataDir, "reminders.json");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    let reminders = [];
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        reminders = JSON.parse(raw || "[]");
      }
    } catch (e) {
      console.error("Failed to read reminders file", e);
      reminders = [];
    }

    reminders.push(reminder);
    try {
      fs.writeFileSync(filePath, JSON.stringify(reminders, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to write reminders file", e);
    }

    // Respond with scheduled info
    res.json({ ok: true, scheduled: reminder });
  } catch (error) {
    console.error("Send reminder error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Background worker: every minute, check for reminders that should be sent (24h before event)
const path = require("path");
const fs = require("fs");
const remindersFile = path.join(__dirname, "data", "reminders.json");

async function sendEmailViaMailjet(rem) {
  if (!MAILJET_API_KEY || !MAILJET_API_SECRET) {
    console.warn("Mailjet credentials missing, skipping send for", rem.toEmail);
    return { ok: false, reason: "missing-credentials" };
  }

  const apiUrl = "https://api.mailjet.com/v3.1/send";
  const body = {
    Messages: [
      {
        From: { Email: FROM_EMAIL, Name: FROM_NAME },
        To: [{ Email: rem.toEmail, Name: rem.toName || rem.toEmail }],
        Subject: `Reminder: ${rem.eventTitle}`,
        TextPart: `Hi ${
          rem.toName || ""
        },\n\nThis is a reminder for the event: ${rem.eventTitle} on ${new Date(
          rem.eventDateISO
        ).toLocaleString()}.\n${
          rem.eventLink ? `More info: ${rem.eventLink}` : ""
        }\n\nSee you there!`,
        HTMLPart: `<p>Hi ${
          rem.toName || ""
        },</p><p>This is a reminder for the event: <strong>${
          rem.eventTitle
        }</strong> on <em>${new Date(
          rem.eventDateISO
        ).toLocaleString()}</em>.</p>${
          rem.eventLink
            ? `<p><a href="${rem.eventLink}" target="_blank">View event</a></p>`
            : ""
        }<p>See you there!</p>`,
      },
    ],
  };

  const auth = Buffer.from(`${MAILJET_API_KEY}:${MAILJET_API_SECRET}`).toString(
    "base64"
  );
  const r = await global.fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  const data = await r.json();
  return { ok: r.ok, data };
}

async function checkAndSendReminders() {
  try {
    if (!fs.existsSync(remindersFile)) return;
    const raw = fs.readFileSync(remindersFile, "utf8");
    let reminders = JSON.parse(raw || "[]");
    const now = new Date();

    let changed = false;
    for (const rem of reminders) {
      if (rem.sent) continue;
      const eventDate = new Date(rem.eventDateISO);
      const sendTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 24h before
      // send if now >= sendTime
      if (now >= sendTime) {
        console.log(
          "Sending scheduled reminder to",
          rem.toEmail,
          "for",
          rem.eventTitle
        );
        const result = await sendEmailViaMailjet(rem);
        rem.sent = result.ok;
        rem.sentAt = new Date().toISOString();
        rem.result = result;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(
        remindersFile,
        JSON.stringify(reminders, null, 2),
        "utf8"
      );
    }
  } catch (e) {
    console.error("checkAndSendReminders error", e);
  }
}

// run every 60s
setInterval(checkAndSendReminders, 60 * 1000);

const port = process.env.PORT || 5050;
app.listen(port, () =>
  console.log(`Mail server listening on http://localhost:${port}`)
);
