// Serverless function to handle GitHub OAuth token exchange
import axios from "axios";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" });
  }

  try {
    // Exchange code for token with GitHub using axios
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.VITE_GITHUB_CLIENT_ID,
        client_secret: process.env.VITE_GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.VITE_HOST}/auth/callback`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const data = response.data;

    if (data.error) {
      return res
        .status(400)
        .json({ error: data.error_description || data.error });
    }

    // Return the token to the client
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error exchanging GitHub code for token:", error);
    return res.status(500).json({
      error: "Failed to exchange code for token",
      message: error.message || "Unknown error",
    });
  }
}
