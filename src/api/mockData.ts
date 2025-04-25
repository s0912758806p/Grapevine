import { IssueType, CommentType } from "../types";
const mockIssues: IssueType[] = [
  {
    id: 1,
    number: 1,
    title: "歡迎來到 Grapevine",
    body: "這是一個示例帖子。在此處分享您的想法和意見。",
    user: {
      login: "admin",
      avatar_url: "https://i.pravatar.cc/150?img=1",
    },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    comments: 5,
    labels: [
      {
        name: "general",
        color: "0075ca",
      },
    ],
    state: "open",
  },
  {
    id: 2,
    number: 2,
    title: "如何使用這個論壇",
    body: "這個論壇提供了多種功能，您可以發布新貼文，回復評論，並與其他用戶交流。",
    user: {
      login: "moderator",
      avatar_url: "https://i.pravatar.cc/150?img=2",
    },
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    comments: 3,
    labels: [
      {
        name: "help",
        color: "d876e3",
      },
    ],
    state: "open",
  },
  {
    id: 3,
    number: 3,
    title: "分享一些有趣的想法",
    body: "今天我思考了一些有趣的想法，想和大家分享。首先，我認為...",
    user: {
      login: "user123",
      avatar_url: "https://i.pravatar.cc/150?img=3",
    },
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    comments: 7,
    labels: [
      {
        name: "discussion",
        color: "fbca04",
      },
    ],
    state: "open",
  },
];
const mockComments: Record<number, CommentType[]> = {
  1: [
    {
      id: 101,
      body: "非常棒的貼文！感謝分享。",
      user: {
        login: "user1",
        avatar_url: "https://i.pravatar.cc/150?img=4",
      },
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 102,
      body: "我同意這個觀點，非常有價值。",
      user: {
        login: "user2",
        avatar_url: "https://i.pravatar.cc/150?img=5",
      },
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ],
  2: [
    {
      id: 201,
      body: "這個教學很有幫助，謝謝！",
      user: {
        login: "newuser",
        avatar_url: "https://i.pravatar.cc/150?img=6",
      },
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  3: [
    {
      id: 301,
      body: "有趣的想法，期待更多內容！",
      user: {
        login: "reader42",
        avatar_url: "https://i.pravatar.cc/150?img=7",
      },
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
};
export const fetchIssues = async (): Promise<IssueType[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockIssues]);
    }, 800);
  });
};
export const fetchIssue = async (
  issueNumber: number
): Promise<IssueType | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const issue = mockIssues.find((issue) => issue.number === issueNumber);
      resolve(issue ? { ...issue } : null);
    }, 600);
  });
};
export const createIssue = async (
  title: string,
  body: string,
  userName: string = "current_user"
): Promise<IssueType | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newIssue: IssueType = {
        id: Date.now(),
        number: mockIssues.length + 1,
        title,
        body,
        user: {
          login: userName,
          avatar_url: `https://i.pravatar.cc/150?img=${
            Math.floor(Math.random() * 50) + 1
          }`,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comments: 0,
        labels: [
          {
            name: "new",
            color: "0E8A16",
          },
        ],
        state: "open",
      };
      mockIssues.unshift(newIssue);
      resolve({ ...newIssue });
    }, 1000);
  });
};
export const createIssueWithLabels = async (
  title: string,
  body: string,
  labels: string[],
  userName: string = "current_user"
): Promise<IssueType | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newIssue: IssueType = {
        id: Date.now(),
        number: mockIssues.length + 1,
        title,
        body,
        user: {
          login: userName,
          avatar_url: `https:
            Math.random() > 0.5 ? "men" : "women"
          }/${Math.floor(Math.random() * 50) + 1}.jpg`,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comments: 0,
        labels: labels.map((label) => ({
          name: label,
          color: Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0"),
        })),
        state: "open",
      };
      mockIssues.unshift(newIssue);
      resolve({ ...newIssue });
    }, 1000);
  });
};
export const fetchComments = async (
  issueNumber: number
): Promise<CommentType[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const commentsArray = mockComments[issueNumber] || [];
      const deepCopy = commentsArray.map((comment) => ({ ...comment }));
      resolve(deepCopy);
    }, 800);
  });
};
export const addComment = async (
  issueNumber: number,
  body: string,
  userName: string = "commenter"
): Promise<CommentType> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newComment: CommentType = {
        id: Date.now(),
        body,
        user: {
          login: userName,
          avatar_url: `https://i.pravatar.cc/150?img=${
            Math.floor(Math.random() * 50) + 1
          }`,
        },
        created_at: new Date().toISOString(),
      };
      if (!mockComments[issueNumber]) {
        mockComments[issueNumber] = [];
      } else if (
        Object.isFrozen(mockComments[issueNumber]) ||
        !Object.isExtensible(mockComments[issueNumber])
      ) {
        mockComments[issueNumber] = [...mockComments[issueNumber]];
      }
      mockComments[issueNumber].push(newComment);
      const issue = mockIssues.find((issue) => issue.number === issueNumber);
      if (issue) {
        issue.comments = (mockComments[issueNumber] || []).length;
      }
      resolve(newComment);
    }, 700);
  });
};
