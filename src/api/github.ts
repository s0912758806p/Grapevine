import { Octokit } from "octokit";
import { IssueType } from "../types";

// Configure your GitHub repository details
const GITHUB_REPO_OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = import.meta.env.VITE_GITHUB_REPO_NAME;
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Initialize Octokit with authentication
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

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

// Create a new issue
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
