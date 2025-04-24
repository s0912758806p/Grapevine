import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { message } from "antd";

interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: GithubUser | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has an active session on component mount
  useEffect(() => {
    const checkSession = async () => {
      // For GitHub authentication with Giscus, check if giscus-session exists
      const token = localStorage.getItem("giscus-session");

      if (token) {
        setIsAuthenticated(true);

        // Try to get user data if we have a token
        try {
          await fetchUserData(token);
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  // Add event listener to track giscus authentication changes
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== "https://giscus.app") return;

      if (event.data?.giscus?.discussion?.authenticated === true) {
        setIsAuthenticated(true);

        // When we get authentication confirmation from giscus, try to fetch user data
        const token = localStorage.getItem("giscus-session");
        if (token) {
          try {
            await fetchUserData(token);
          } catch (err) {
            console.error(
              "Failed to fetch user data after authentication:",
              err
            );
          }
        }
      } else if (event.data?.giscus?.discussion?.authenticated === false) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Fetch GitHub user data
  const fetchUserData = async (token: string) => {
    // This is a simplified method to get user data
    // In a real app, you would use the token to make a proper API call

    try {
      // Log the token for debugging purposes
      console.log(
        "Using GitHub session token:",
        token.substring(0, 10) + "..."
      );

      // We're using a message from giscus as a proxy for user data
      const iframe = document.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame"
      );
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { getUserData: true } } },
          "https://giscus.app"
        );

        // For demo purposes, we'll create a mock user
        // In a real app, you'd get this data from GitHub API using the token
        const mockUser: GithubUser = {
          login: "github-user",
          id: 12345,
          avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
          name: "GitHub User",
        };

        setUser(mockUser);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      throw err;
    }
  };

  const login = () => {
    // Redirect to GitHub OAuth flow
    // This is a placeholder - in real implementation, we'd redirect to the GitHub OAuth URL
    // For Giscus, we will use the built-in authentication feature of Giscus component
    setLoading(true);

    // In a real implementation, you'd redirect to GitHub, but for Giscus
    // we rely on the component to handle this, so this is just a placeholder
    message.info(
      "Please use the Sign in with GitHub button in the comments section"
    );
    setLoading(false);
  };

  const logout = () => {
    // Remove giscus session
    localStorage.removeItem("giscus-session");
    setIsAuthenticated(false);
    setUser(null);

    // Also notify giscus iframe to log out
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { authentication: "none" } } },
        "https://giscus.app"
      );
    }

    message.success("Logged out successfully");
  };

  // Handle the OAuth callback
  const handleAuthCallback = async (code: string) => {
    setLoading(true);
    try {
      // For Giscus, we store the code and let Giscus handle the token exchange
      localStorage.setItem("giscus-code", code);
      setIsAuthenticated(true);
      setLoading(false);
      message.success("Successfully authenticated with GitHub");
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Failed to authenticate with GitHub");
      setLoading(false);
      throw err;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    handleAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
