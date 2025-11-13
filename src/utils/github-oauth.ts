import { GITHUB_CLIENT_ID } from "@/config/api";

/**
 * GitHub OAuth utility functions
 */

/**
 * Generate GitHub OAuth authorization URL
 */
export function getGitHubAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "user:email",
    state: state || Math.random().toString(36).substring(7),
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
