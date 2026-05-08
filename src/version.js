export const APP_VERSION =
  import.meta.env.VITE_APP_VERSION ||
  import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
  "dev";
