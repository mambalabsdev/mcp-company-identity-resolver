#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(here, "..", "package.json"), "utf8"),
) as { version: string; name: string };

// Distinctive UA so Apify run meta.userAgent marks MCP-originated runs.
const USER_AGENT = `mambalabs-mcp ${pkg.name}@${pkg.version}`;

const APIFY_TOKEN = process.env.APIFY_TOKEN;

type ToolResult = {
  isError?: boolean;
  content: Array<{ type: "text"; text: string }>;
};

// Drop undefined values so optional inputs are not sent to the actor.
function compact(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// The actor validates its input schema before running and types skipCache as a
// string ("true"/"false") for Clay compatibility. We expose it as a boolean to
// the model for a cleaner tool surface, then coerce to the string form the actor
// accepts. Returns undefined for an undefined flag so it stays out of the body.
function boolToString(v: boolean | undefined): string | undefined {
  return v === undefined ? undefined : v ? "true" : "false";
}

// Shared caller. actorPath is the actor's immutable Apify actor ID (a stable key
// that survives Store renames). The /v2/acts/{id} endpoint accepts it directly,
// so a Store rename never breaks these calls.
async function runActor(
  actorPath: string,
  actorLabel: string,
  input: Record<string, unknown>,
): Promise<ToolResult> {
  if (!APIFY_TOKEN) {
    return { isError: true, content: [{ type: "text", text: "APIFY_TOKEN is not set. Create a token at https://console.apify.com/account/integrations and set it as the APIFY_TOKEN environment variable." }] };
  }

  const url = `https://api.apify.com/v2/acts/${actorPath}/run-sync-get-dataset-items?timeout=300`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${APIFY_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify(input),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { isError: true, content: [{ type: "text", text: `Could not reach the Apify API: ${message}` }] };
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body?.error?.message) detail = ` ${body.error.message}`;
    } catch {
      detail = "";
    }

    let message: string;
    switch (response.status) {
      case 401:
        message = "Invalid Apify token. Check your APIFY_TOKEN environment variable.";
        break;
      case 402:
        message =
          "Insufficient Apify credits. Check your account balance at https://console.apify.com/billing";
        break;
      case 408:
        message = `The ${actorLabel} run timed out after 300 seconds. Try again, or run the actor on Apify directly for longer jobs.`;
        break;
      default:
        message = `Apify request to ${actorLabel} failed with status ${response.status}.${detail}`;
    }
    return { isError: true, content: [{ type: "text", text: message }] };
  }

  const items = await response.json();
  return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
}

const server = new McpServer({
  name: "mamba-company-identity-resolver",
  version: pkg.version,
});

// Company Identity Resolver (immutable actor ID lr8fTRAmZCBZmuwwh)
server.registerTool(
  "resolve_company_identity",
  {
    title: "Resolve Company Identity",
    description:
      "Resolve any combination of company name, domain, or LinkedIn URL into one canonical company identity: the name, primary domain, and LinkedIn company URL, each with a 0-100 confidence score plus an overall score and a match method. Cross-checks the inputs you give it, resolves the ones you do not, and flags conflicts (a domain and a LinkedIn slug that disagree) instead of merging them. Login-free and public-data only. Returns flat Clay-ready JSON. Read-only; requires an APIFY_TOKEN and consumes Apify credits per call.",
    annotations: {
      title: "Resolve Company Identity",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      company_name: z
        .string()
        .optional()
        .describe("Company name, e.g. Stripe. Provide at least one of company_name, domain, or linkedin_url."),
      domain: z
        .string()
        .optional()
        .describe("Bare company domain, e.g. stripe.com. The strongest canonical key when provided."),
      linkedin_url: z
        .string()
        .optional()
        .describe("LinkedIn company URL (https://www.linkedin.com/company/stripe) or bare slug (stripe)."),
      skipCache: z
        .boolean()
        .optional()
        .describe("Force a fresh resolution and ignore the 7 day result cache."),
    },
  },
  async ({ company_name, domain, linkedin_url, skipCache }) => {
    if (
      (company_name === undefined || company_name === "") &&
      (domain === undefined || domain === "") &&
      (linkedin_url === undefined || linkedin_url === "")
    ) {
      return {
        isError: true,
        content: [{ type: "text", text: "Provide at least one of company_name, domain, or linkedin_url." }],
      };
    }
    return runActor(
      "lr8fTRAmZCBZmuwwh",
      "Company Identity Resolver",
      compact({
        company_name,
        domain,
        linkedin_url,
        skipCache: boolToString(skipCache),
      }),
    );
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
