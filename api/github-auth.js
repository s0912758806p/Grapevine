// GitHub OAuth 處理 serverless 函數
import axios from "axios";

// GitHub OAuth 配置
const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET =
  process.env.GITHUB_CLIENT_SECRET || process.env.VITE_GITHUB_CLIENT_SECRET;
const HOST = process.env.HOST || process.env.VITE_HOST;
const GITHUB_REDIRECT_URI = `${HOST}/auth/callback`;

// GitHub API URLs
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export default async function handler(req, res) {
  // 僅支持 POST 請求
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // 使用授權碼交換訪問令牌
    const response = await axios.post(GITHUB_TOKEN_URL, null, {
      params: {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: GITHUB_REDIRECT_URI,
      },
      headers: {
        Accept: "application/json",
      },
    });

    // 返回訪問令牌
    if (response.data && response.data.access_token) {
      return res.status(200).json({ access_token: response.data.access_token });
    } else {
      return res.status(400).json({ error: "Failed to get access token" });
    }
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
