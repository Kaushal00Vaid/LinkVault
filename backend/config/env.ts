import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const env = {
  port: getEnv("PORT", "8000"),
  mongoUri: getEnv("MONGO_URI"),
  clientUrl: getEnv("CLIENT_URL"),

  accessTokenSecret: getEnv("ACCESS_TOKEN_SECRET"),
  accessTokenExpiry: getEnv("ACCESS_TOKEN_EXPIRY"),

  refreshTokenSecret: getEnv("REFRESH_TOKEN_SECRET"),
  refreshTokenExpiry: getEnv("REFRESH_TOKEN_EXPIRY"),

  google: {
    clientId: getEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
    redirectUri: getEnv("GOOGLE_REDIRECT_URI"),
  },

  github: {
    clientId: getEnv("GITHUB_CLIENT_ID"),
    clientSecret: getEnv("GITHUB_CLIENT_SECRET"),
    redirectUri: getEnv("GITHUB_REDIRECT_URI"),
  },
} as const;

export default env;
