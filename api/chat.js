export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST."
    });
  }

  try {
    const { message, sensorContext } = req.body || {};

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OpenRouter API key."
      });
    }

    const systemPrompt = `
You are a helpful smart home assistant inside a browser-based Smart Home Monitoring System.
You help the user understand indoor temperature, humidity, air quality, energy usage and smart device status.
Use the provided sensor data when it is available.
Keep answers short, practical and easy to understand.
`;

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://smart-home-monitor-browser.vercel.app",
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

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();

      return res.status(openRouterResponse.status).json({
        error: "OpenRouter request failed.",
        details: errorText
      });
    }

    const data = await openRouterResponse.json();

    const reply =
      data.choices?.[0]?.message?.content || "No answer was generated.";

    return res.status(200).json({
      reply
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error.",
      details: error.message
    });
  }
}