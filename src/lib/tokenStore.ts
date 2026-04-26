// ==========================================================
// 🔐 In-memory Access Token Store
// ==========================================================
// Access token is stored in memory (NOT localStorage)
// This makes it safe from XSS and keeps it short-lived

let accessToken: string | null = null;

export const tokenStore = {
  // Get current access token
  get: () => accessToken,

  // Set access token after login / refresh
  set: (token: string | null) => {
    accessToken = token;
  },

  // Clear token on logout or refresh failure
  clear: () => {
    accessToken = null;
  },
};
