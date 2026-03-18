# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in repo-knowledge, please report it by opening a GitHub issue at:

https://github.com/mcp-tool-shop-org/repo-knowledge/issues

**When reporting:**
- Describe the vulnerability and its potential impact
- Include steps to reproduce if possible
- Do NOT include secrets, credentials, or API keys in your report

## Response

We aim to acknowledge reports within 72 hours and provide a fix or mitigation plan within 14 days for confirmed vulnerabilities.

## Scope

This policy covers the `@mcptoolshop/repo-knowledge` npm package, including:
- The `rk` CLI
- The MCP server
- Database schema and migrations
- Bundled templates

## Security Considerations

- repo-knowledge stores data in a local SQLite database. The database may contain repository metadata, notes, and audit findings. Treat the database file with appropriate access controls.
- The MCP server runs locally over stdio. It does not expose network endpoints.
- GitHub sync uses the `gh` CLI and inherits its authentication. No credentials are stored by repo-knowledge.
