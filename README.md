# Grapevine Forum

A minimalist forum application that uses GitHub Issues for data storage and Giscus for comments. Styled with Ant Design to mimic the look and feel of GitHub Issues.

## Features

- View list of issues/discussion threads
- Create new issues/threads
- View issue details with Giscus comments
- GitHub Issues integration for data storage
- Responsive design with Ant Design UI components

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure GitHub repository:

   - Edit `src/api/github.ts` to add your GitHub username and repository name
   - Generate a GitHub Personal Access Token with the appropriate permissions
   - Setup Giscus for your repository (https://giscus.app)
   - Update the Giscus configuration in `src/components/IssueDetail.tsx`

4. Start the development server:
   ```
   npm run dev
   ```

## Configuration

### GitHub Issues

Update the following values in `src/api/github.ts`:

```ts
const GITHUB_REPO_OWNER = "your-github-username";
const GITHUB_REPO_NAME = "your-repo-name";
```

### Giscus Comments

Update the Giscus component in `src/components/IssueDetail.tsx` with your repository details:

```jsx
<Giscus
  repo="your-github-username/your-repo-name"
  repoId="your-repo-id"
  category="Announcements"
  categoryId="your-category-id"
  // other properties...
/>
```

Visit [Giscus](https://giscus.app) to get your repository's configuration values.

## Technologies

- React 19
- TypeScript
- Redux Toolkit
- Ant Design
- React Router
- Giscus
- Octokit (GitHub API)
- Dayjs (Date formatting)
- Vite (Build tool)

## Deployment

This application can be deployed to Vercel with the following command:

```
npm run build
vercel
```
