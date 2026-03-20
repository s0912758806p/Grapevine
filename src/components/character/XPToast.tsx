import { message } from "antd";
import { XPEvent, XP_REWARDS } from "../../store/characterSlice";

/**
 * Show a non-blocking XP gain notification.
 * Call this after dispatching gainXP.
 */
export function showXPToast(event: XPEvent): void {
  const amount = XP_REWARDS[event];
  const labels: Record<XPEvent, string> = {
    view_article: "Article read",
    post_issue:   "Issue posted",
    post_rumor:   "Rumor posted",
    vote_rumor:   "Vote cast",
    daily_visit:  "Daily visit",
  };
  message.open({
    type: "success",
    content: `+${amount} XP — ${labels[event]}`,
    duration: 2,
    style: {
      fontSize: 13,
    },
  });
}
