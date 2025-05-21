import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// Assume API functions will be created in a similar fashion to f2eIssuesSlice
// e.g., import { fetchRuanyfWeeklyIssues, fetchRuanyfWeeklyIssue } from "../api/ruanyfWeeklyApi";

// Define a placeholder for the raw API response structure
// Replace this with the actual interface for your API data
interface RawRuanyfWeeklyIssuePayload {
  id: string | number;
  title: string;
  body?: string;
  content?: string;
  author?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  html_url?: string;
  source_url?: string;
  labels?: Array<{ name: string; color?: string }>;
  number?: number;
  comments?: number;
  user?: { login: string; avatar_url?: string };
  [key: string]: unknown; // Allow other properties if the API response is flexible
}

// Placeholder API functions - replace with your actual API calls
const fetchRuanyfWeeklyIssues = async (
  page: number,
  perPage: number
): Promise<RawRuanyfWeeklyIssuePayload[]> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/ruanyf/weekly/issues?page=${page}&per_page=${perPage}`
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching ruanyf weekly issues:", error);
    throw error;
  }
};

const fetchRuanyfWeeklyIssue = async (
  issueId: string
): Promise<RawRuanyfWeeklyIssuePayload> => {
  try {
    // GitHub API expects a number for issues, but our router might provide a string
    // Make sure to parse it if it's a number
    const issueNumber = !isNaN(Number(issueId)) ? issueId : null;

    if (!issueNumber) {
      console.error(`Invalid issue ID: ${issueId}`);
      throw new Error("Invalid issue ID");
    }

    const response = await fetch(
      `https://api.github.com/repos/ruanyf/weekly/issues/${issueNumber}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Issue #${issueNumber} not found`);
        throw new Error("Weekly issue not found");
      }
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ruanyf weekly issue #${issueId}:`, error);
    throw error;
  }
};

export interface RuanyfWeeklyLabel {
  name: string;
  color?: string; // color might be optional
}

// Define the structure of a Ruanyf Weekly Issue
export interface RuanyfWeeklyIssueType {
  id: string; // Assuming id is a string, adjust if different
  title: string;
  body?: string; // Or content, main text of the weekly
  content?: string; // Alternative to body
  author?: string; // If there's an author field
  published_at: string; // Date of publication
  created_at?: string; // If different from published_at
  updated_at?: string;
  html_url?: string; // Link to the original source if available
  source_url?: string; // Alternative for html_url
  labels?: RuanyfWeeklyLabel[];
  // Add any other fields relevant to Ruanyf Weekly issues
  // e.g., tags, categories, summary etc.
  number: number; // GitHub issue number - required for routing
  comments?: number; // If you track comments directly on the object
  user?: {
    // If there's a user object similar to GitHub
    login: string;
    avatar_url?: string;
  };
}

interface RuanyfWeeklyState {
  issues: RuanyfWeeklyIssueType[];
  currentIssue: RuanyfWeeklyIssueType | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentPage: number;
  hasMorePages: boolean;
}

const initialState: RuanyfWeeklyState = {
  issues: [],
  currentIssue: null,
  status: "idle",
  error: null,
  currentPage: 1,
  hasMorePages: true,
};

// Transform API response to RuanyfWeeklyIssueType
const transformRuanyfWeeklyIssue = (
  issue: RawRuanyfWeeklyIssuePayload
): RuanyfWeeklyIssueType => {
  return {
    id: String(issue.id || issue.number || Date.now()), // Ensure ID is a string
    title: String(issue.title || "Untitled Issue"),
    body: issue.body ? String(issue.body) : undefined,
    content: issue.content ? String(issue.content) : undefined,
    author: issue.author ? String(issue.author) : undefined,
    published_at: String(
      issue.published_at || issue.created_at || new Date().toISOString()
    ),
    created_at: issue.created_at ? String(issue.created_at) : undefined,
    updated_at: issue.updated_at ? String(issue.updated_at) : undefined,
    html_url: issue.html_url ? String(issue.html_url) : undefined,
    source_url: issue.source_url ? String(issue.source_url) : undefined,
    labels: Array.isArray(issue.labels)
      ? issue.labels.map((label: { name: string; color?: string }) => ({
          name: String(label.name || ""),
          color: label.color ? String(label.color) : undefined,
        }))
      : [],
    number: Number(issue.number || 0), // Ensure number is always set
    comments: issue.comments ? Number(issue.comments) : undefined,
    user: issue.user
      ? {
          login: String(issue.user.login || "unknown"),
          avatar_url: issue.user.avatar_url
            ? String(issue.user.avatar_url)
            : undefined,
        }
      : undefined,
  };
};

export const fetchRuanyfWeeklyIssuesThunk = createAsyncThunk(
  "ruanyfWeekly/fetchIssues",
  async (
    { page, perPage }: { page: number; perPage: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchRuanyfWeeklyIssues(page, perPage);
      const transformedData = response.map(transformRuanyfWeeklyIssue);
      return {
        data: transformedData,
        page,
        perPage,
        totalItems: response.length,
      }; // Assuming API might not give total, use response.length for hasMorePages logic
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch weekly issues";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchRuanyfWeeklyIssueThunk = createAsyncThunk(
  "ruanyfWeekly/fetchIssue",
  async (issueId: string, { rejectWithValue }) => {
    // issueId is a string
    try {
      const issue = await fetchRuanyfWeeklyIssue(issueId);
      if (!issue || Object.keys(issue).length === 0) {
        // Handle case where issue might be empty or not found
        return rejectWithValue("Weekly issue not found");
      }
      return transformRuanyfWeeklyIssue(issue);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch weekly issue";
      return rejectWithValue(errorMessage);
    }
  }
);

export const ruanyfWeeklySlice = createSlice({
  name: "ruanyfWeekly",
  initialState,
  reducers: {
    resetRuanyfWeeklyStatus: (state) => {
      state.status = "idle";
    },
    clearCurrentRuanyfWeeklyIssue: (state) => {
      state.currentIssue = null;
    },
    setCurrentRuanyfWeeklyPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRuanyfWeeklyIssuesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null; // Clear previous errors
      })
      .addCase(fetchRuanyfWeeklyIssuesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { data, page, perPage } = action.payload;
        if (page === 1) {
          state.issues = data;
        } else {
          state.issues = [...state.issues, ...data];
        }
        state.hasMorePages = data.length === perPage;
        state.currentPage = page;
      })
      .addCase(fetchRuanyfWeeklyIssuesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchRuanyfWeeklyIssueThunk.pending, (state) => {
        state.status = "loading";
        state.error = null; // Clear previous errors
      })
      .addCase(fetchRuanyfWeeklyIssueThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentIssue = action.payload;
      })
      .addCase(fetchRuanyfWeeklyIssueThunk.rejected, (state, action) => {
        state.status = "failed";
        state.currentIssue = null; // Clear current issue on failure
        state.error = action.payload as string;
      });
  },
});

export const {
  resetRuanyfWeeklyStatus,
  clearCurrentRuanyfWeeklyIssue,
  setCurrentRuanyfWeeklyPage,
} = ruanyfWeeklySlice.actions;

export default ruanyfWeeklySlice.reducer;
