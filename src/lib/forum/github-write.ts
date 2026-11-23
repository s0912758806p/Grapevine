import "server-only";

/**
 * GitHub Discussions writes, always made with the signed-in member's own
 * GitHub App user token (so posts are attributed to them on GitHub).
 */
import { getBoard } from "../boards";
import { githubForum } from "../config";
import { graphql, GitHubError } from "../github/graphql";
import { withMeta, type ThreadMeta } from "./meta";

export type ReactionContent = "HOORAY" | "HEART" | "THUMBS_UP" | "THUMBS_DOWN";

function forum() {
  const gh = githubForum();
  if (!gh) throw new GitHubError("GitHub Discussions is not configured");
  return gh;
}

/** Repository and category node ids, read with the server token (categories are public). */
async function targetIds(boardSlug: string): Promise<{ repositoryId: string; categoryId: string }> {
  const { repo, readToken } = forum();
  const board = getBoard(boardSlug);
  if (!board) throw new GitHubError("Unknown board", 400);
  const data = await graphql<{ repository: { id: string; discussionCategories: { nodes: { id: string; name: string }[] } } }>(
    `query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { id discussionCategories(first: 25) { nodes { id name } } } }`,
    { owner: repo.owner, name: repo.name },
    readToken,
  );
  const category = data.repository.discussionCategories.nodes.find(
    (c) => c.name.toLowerCase() === board.discussionCategory.toLowerCase(),
  );
  if (!category) throw new GitHubError(`Discussions category "${board.discussionCategory}" does not exist`, 404);
  return { repositoryId: data.repository.id, categoryId: category.id };
}

export async function createDiscussion(
  token: string,
  input: { board: string; title: string; body: string; meta: ThreadMeta },
): Promise<{ number: number }> {
  const ids = await targetIds(input.board);
  const data = await graphql<{ createDiscussion: { discussion: { number: number } } }>(
    `mutation($input: CreateDiscussionInput!) { createDiscussion(input: $input) { discussion { number } } }`,
    { input: { ...ids, title: input.title, body: withMeta(input.body, input.meta) } },
    token,
  );
  return data.createDiscussion.discussion;
}

export async function addComment(token: string, discussionId: string, body: string, replyToId?: string): Promise<void> {
  await graphql(
    `mutation($input: AddDiscussionCommentInput!) { addDiscussionComment(input: $input) { comment { id } } }`,
    { input: { discussionId, body, ...(replyToId ? { replyToId } : {}) } },
    token,
  );
}

export async function setUpvote(token: string, subjectId: string, on: boolean): Promise<void> {
  const mutation = on ? "addUpvote" : "removeUpvote";
  await graphql(`mutation($id: ID!) { ${mutation}(input: { subjectId: $id }) { clientMutationId } }`, { id: subjectId }, token);
}

export async function setReaction(token: string, subjectId: string, content: ReactionContent, on: boolean): Promise<void> {
  const mutation = on ? "addReaction" : "removeReaction";
  await graphql(
    `mutation($id: ID!, $content: ReactionContent!) { ${mutation}(input: { subjectId: $id, content: $content }) { clientMutationId } }`,
    { id: subjectId, content },
    token,
  );
}

export async function votePoll(token: string, pollOptionId: string): Promise<void> {
  await graphql(
    `mutation($id: ID!) { addDiscussionPollVote(input: { pollOptionId: $id }) { clientMutationId } }`,
    { id: pollOptionId },
    token,
  );
}
