# Company Identity Resolver MCP Server

[![Smithery](https://smithery.ai/badge/mambabuilt/mcp-company-identity-resolver)](https://smithery.ai/servers/mambabuilt/mcp-company-identity-resolver) [![Glama score](https://glama.ai/mcp/servers/mambalabsdev/mcp-company-identity-resolver/badges/score.svg)](https://glama.ai/mcp/servers/mambalabsdev/mcp-company-identity-resolver) [![MCP Registry](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fregistry.modelcontextprotocol.io%2Fv0%2Fservers%3Fsearch%3Dcom.mambabuilt%252Fmcp-company-identity-resolver%26limit%3D1&query=%24.servers%5B0%5D._meta%5B%22io.modelcontextprotocol.registry%2Fofficial%22%5D.status&label=mcp%20registry&color=blue)](https://registry.modelcontextprotocol.io/v0/servers?search=com.mambabuilt/mcp-company-identity-resolver&limit=1) [![npm version](https://img.shields.io/npm/v/@mambalabsdev/mcp-company-identity-resolver)](https://www.npmjs.com/package/@mambalabsdev/mcp-company-identity-resolver) [![npm downloads](https://img.shields.io/npm/dm/@mambalabsdev/mcp-company-identity-resolver)](https://www.npmjs.com/package/@mambalabsdev/mcp-company-identity-resolver) [![license](https://img.shields.io/github/license/mambalabsdev/mcp-company-identity-resolver)](https://github.com/mambalabsdev/mcp-company-identity-resolver/blob/main/LICENSE) [![mcpservers.org](https://img.shields.io/badge/mcpservers.org-listed-blue)](https://mcpservers.org/servers/mambalabsdev/mcp-company-identity-resolver)

An MCP server that exposes the Mamba Labs Company Identity Resolver as a single tool. Install one package and give your MCP client a way to turn any combination of company name, domain, or LinkedIn URL into one canonical company identity tuple with confidence scores, wrapping the Mamba Labs actor on Apify and returning Clay-ready flat JSON.

## What's Inside

- [What it does](#what-it-does)
- [Quick start](#quick-start)
- [Prerequisites](#prerequisites)
- [Example prompts](#example-prompts)
- [Tool and inputs](#tool-and-inputs)
- [Full actor documentation](#full-actor-documentation)
- [Mamba Labs GTM Suite](#mamba-labs-gtm-suite)
- [License](#license)

## What it does

This server gives an AI client one tool:

- `resolve_company_identity`: resolve any combination of company name, domain, or LinkedIn URL into the canonical name, primary domain, and LinkedIn company URL, each with a 0-100 confidence score plus an overall score and a match method. It cross-checks the inputs you give it, resolves the ones you do not, and flags conflicts (a domain and a LinkedIn slug that disagree) instead of merging them.

All of the work runs on Apify. This package is a thin client that routes the tool call to the actor and hands back the result.

## Quick start

You need Node.js 18 or newer and an Apify account with an API token.

Add this to your Claude Desktop config:

```json
{
  "mcpServers": {
    "company-identity-resolver": {
      "command": "npx",
      "args": ["-y", "@mambalabsdev/mcp-company-identity-resolver"],
      "env": {
        "APIFY_TOKEN": "your-apify-token"
      }
    }
  }
}
```

Get your token at https://console.apify.com/account/integrations, paste it in, and restart Claude Desktop. The tool will be available.

## Prerequisites

- Node.js 18 or newer
- An Apify account with an API token

## Example prompts

- "Resolve the canonical identity for the company 'Stripe' and give me its domain and LinkedIn URL with confidence scores."
- "I have the domain notion.so; what is the canonical company name and LinkedIn URL?"
- "Do domain stripe.com and LinkedIn slug notion refer to the same company?"
- "Resolve the company at linkedin.com/company/gitlab-com into its domain and name."

## Tool and inputs

`resolve_company_identity`:

- `company_name` (string): company name, e.g. Stripe. Provide at least one of `company_name`, `domain`, or `linkedin_url`.
- `domain` (string): bare company domain, e.g. stripe.com. The strongest canonical key when provided.
- `linkedin_url` (string): LinkedIn company URL (https://www.linkedin.com/company/stripe) or bare slug (stripe).
- `skipCache` (boolean): force a fresh resolution and ignore the 7 day result cache.

The output is one flat row: the echoed inputs, the canonical `name`, `domain`, and `linkedin_url`, the overall `confidence_score`, the `match_method` (`exact_domain`, `search_resolved`, `linkedin_pattern`, `jsonld`, `conflict`, or `unresolved`), the per-field `domain_confidence`, `linkedin_confidence`, and `name_confidence`, and a `resolved` boolean.

## Full actor documentation

For the complete input and output reference, pricing, and run history, see the Company Identity Resolver actor on the Apify Store (canonical immutable Actor ID URL):

https://apify.com/mambalabs/lr8fTRAmZCBZmuwwh

---

## Mamba Labs GTM Suite

This server is part of the **Mamba Labs GTM Suite**, a fleet of twelve specialized MCP servers for go-to-market signal intelligence, each backed by a dedicated Apify actor.

| Actor | Immutable Actor ID |
|---|---|
| [GTM Hiring Signal Scraper](https://console.apify.com/actors/D7O1SA2EqwHGsGr1P) | `D7O1SA2EqwHGsGr1P` |
| [GTM Tech Stack Signal Enrichment](https://console.apify.com/actors/qyd7nNyqFPelQViBx) | `qyd7nNyqFPelQViBx` |
| [GTM Signals Aggregator](https://console.apify.com/actors/xKdRfnfFNkdMpFuNs) | `xKdRfnfFNkdMpFuNs` |
| [Job Board Keyword Signal Scanner](https://console.apify.com/actors/4DvqpvhMR74NLcDDY) | `4DvqpvhMR74NLcDDY` |
| [Domain to LinkedIn URL Resolver](https://console.apify.com/actors/3HtnSaqPHOg1Qg5gx) | `3HtnSaqPHOg1Qg5gx` |
| [ICP Fit Scorer](https://console.apify.com/actors/W161DT8W4kW55dMFh) | `W161DT8W4kW55dMFh` |
| [Domain Deliverability Checker](https://console.apify.com/actors/0tVgxI7A6o9jMlxmc) | `0tVgxI7A6o9jMlxmc` |
| [Company Firmographic Enricher](https://console.apify.com/actors/YlUtLWjfPpqykmB8g) | `YlUtLWjfPpqykmB8g` |
| [Company Social Presence Mapper](https://console.apify.com/actors/4k6CCemkgBDz18m2h) | `4k6CCemkgBDz18m2h` |
| [Company Identity Resolver](https://console.apify.com/actors/lr8fTRAmZCBZmuwwh) | `lr8fTRAmZCBZmuwwh` |
| [Company Change-Event Feed](https://console.apify.com/actors/oX44rS0fkEJ3rXLWe) | `oX44rS0fkEJ3rXLWe` |
| [Funding & Press Signal Scanner](https://console.apify.com/actors/FS13X6dhQVgX3XOM6) | `FS13X6dhQVgX3XOM6` |

> Built by [Mamba Labs](https://github.com/mambalabsdev) | [npm](https://www.npmjs.com/org/mambalabsdev) | [Apify Store](https://apify.com/mambalabs)

## License

MIT

Built by Mamba Labs. https://apify.com/mambalabs
