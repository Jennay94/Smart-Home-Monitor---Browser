const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve frontend files from the project root folder
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sensorContext } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OpenRouter API key. Please check the .env file."
      });
    }

    const systemPrompt = `
You are a helpful smart home assistant inside a browser-based Smart Home Monitoring System.
You help the user understand indoor temperature, humidity, air quality, energy usage and smart device status.
Use the provided sensor data when it is available.
Keep answers short, practical and easy to understand.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Smart Home Monitoring System"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `
Current smart home sensor data:
${JSON.stringify(sensorContext, null, 2)}

User question:
${message}
`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: "OpenRouter request failed.",
        details: errorText
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No answer was generated.";

    res.json({ reply });
  } catch (error) {
    res.status(500).json({
      error: "Server error.",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Smart Home Monitoring System is running at http://localhost:${PORT}`);
});