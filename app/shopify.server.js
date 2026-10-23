import { shopifyApp, AppDistribution } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server.js";

const apiKey = process.env.SHOPIFY_API_KEY || "aba15c2b5828795eb89e10f73e91ff06";
const apiSecretKey = process.env.SHOPIFY_API_SECRET || "";
const appUrl = process.env.SHOPIFY_APP_URL || process.env.RENDER_EXTERNAL_URL || "https://utsav-shopify.onrender.com";
const scopes = (process.env.SCOPES || "read_themes,write_themes,read_script_tags,write_script_tags").split(",");

const shopify = shopifyApp({
  apiKey,
  apiSecretKey,
  apiVersion: "2024-10",
  scopes,
  appUrl,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = "2024-10";
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
