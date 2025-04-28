const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:*', 'https://*.vercel.app', 'https://*.onrender.com'] // Allowed domains
}));
app.use(express.json());

// Health advice endpoint (Vercel requires absolute paths)
app.post('/api/health-advice', async (req, res) => {
  try {
    const { issue } = req.body;
    
    if (!issue) {
      return res.status(400).json({ error: "Health issue is required" });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY}`,
      {
        contents: [{
          parts: [{ text: `Provide first aid or health advice for: ${issue}` }]
        }]
      }
    );

    if (response.data.candidates?.[0]) {
      res.json({ advice: response.data.candidates[0].content.parts[0].text });
    } else {
      throw new Error("No advice found in response");
    }
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || "Failed to fetch health advice" 
    });
  }
});

// Export for Vercel
module.exports = app;

// Local development support
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Local server running on http://localhost:${PORT}`));
}