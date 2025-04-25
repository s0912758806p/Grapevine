# Grapevine Forum

A minimalist forum application that uses GitHub Issues for data storage and Giscus for comments. Styled with Ant Design to present a Reddit-like experience.

## Features

- Reddit-style user interface
- Post upvoting/downvoting functionality
- Posts and comments system
- GitHub Issues integration for data storage
- Giscus integration for comments
- Fully responsive design for mobile devices
- Secure GitHub OAuth authentication using Serverless API
- Deployable to Vercel with Serverless Functions

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```
3. Configure environment variables:
   Create a `.env` file in the project root directory and add the following:

   ```
   VITE_GITHUB_REPO_OWNER=your-github-username
   VITE_GITHUB_REPO_NAME=your-repository-name
   VITE_GITHUB_TOKEN=your-personal-access-token
   ```

4. Configure Giscus:

   - Set up your repository at https://giscus.app
   - Update the Giscus component configuration in `src/components/IssueDetail.tsx`

5. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables Configuration

The project uses environment variables to configure GitHub API connections:

### GitHub Issues API

Set the following environment variables in the `.env` file for local development:

```
VITE_GITHUB_REPO_OWNER=your-github-username
VITE_GITHUB_REPO_NAME=your-repository-name
VITE_GITHUB_TOKEN=your-personal-access-token
```

For deployment on Vercel, configure these in the Vercel project settings:

```
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=your-repository-name
GITHUB_TOKEN=your-personal-access-token
HOST=your-deployed-app-url
```

### Giscus Comments

Update the GiscusWrapper component in `src/components/IssueDetail.tsx`:

```jsx
<Giscus
  repo="your-github-username/your-repository-name"
  repoId="your-repository-id"
  category="Announcements"
  categoryId="your-category-id"
  // other properties...
/>
```

Visit [Giscus](https://giscus.app) to get your repository configuration values.

## Technology Stack

- React 18
- TypeScript
- Redux Toolkit
- Ant Design 5
- React Router 6
- Giscus (comment system)
- Octokit (GitHub API client)
- Dayjs (date formatting)
- Vite 6 (build tool)
- SASS (style preprocessor)

## Deployment

This application can be deployed to Vercel with Serverless Functions support:

```
npm run build
vercel
```

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions and environment variable configuration.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
