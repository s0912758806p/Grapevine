import { Octokit } from "octokit";
import { IssueType } from "../types";

// login github information
const GITHUB_REPO_OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = import.meta.env.VITE_GITHUB_REPO_NAME;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Initialize Octokit with default authentication
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Create Octokit instance with user token
export const createOctokitWithUserToken = (token: string) => {
  return new Octokit({
    auth: token,
  });
};

// Fetch all issues
export const fetchIssues = async (): Promise<IssueType[]> => {
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      state: "all",
      per_page: 100,
    });

    return response.data as IssueType[];
  } catch (error) {
    console.error("Error fetching issues:", error);
    return [];
  }
};

// Fetch a single issue by number
export const fetchIssue = async (
  issueNumber: number
): Promise<IssueType | null> => {
  try {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      {
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
        issue_number: issueNumber,
      }
    );

    return response.data as IssueType;
  } catch (error) {
    console.error(`Error fetching issue #${issueNumber}:`, error);
    return null;
  }
};

// Create a new issue with default app token
export const createIssue = async (
  title: string,
  body: string
): Promise<IssueType | null> => {
  try {
    const response = await octokit.request(
      "POST /repos/{owner}/{repo}/issues",
      {
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
        title,
        body,
      }
    );

    return response.data as IssueType;
  } catch (error) {
    console.error("Error creating issue:", error);
    return null;
  }
};

// Create a new issue with user's token and optional custom repository
export const createIssueAsUser = async (
  title: string,
  body: string,
  token: string,
  customOwner?: string,
  customRepo?: string
): Promise<IssueType | null> => {
  try {
    const userOctokit = createOctokitWithUserToken(token);

    const response = await userOctokit.request(
      "POST /repos/{owner}/{repo}/issues",
      {
        owner: customOwner || GITHUB_REPO_OWNER,
        repo: customRepo || GITHUB_REPO_NAME,
        title,
        body,
      }
    );

    return response.data as IssueType;
  } catch (error) {
    console.error("Error creating issue as user:", error);
    return null;
  }
};

// Get authenticated user information
export const getAuthenticatedUser = async (token: string) => {
  try {
    const userOctokit = createOctokitWithUserToken(token);
    const response = await userOctokit.request("GET /user");
    return response.data;
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    return null;
  }
};
