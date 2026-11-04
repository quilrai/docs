---
sidebar_position: 3
sidebar_label: "Requirements"
sidebar_custom_props:
  icon: ClipboardList
description: "What to collect from the development team before you red team an application, agent, or AI workflow."
aliases: [requirements, prerequisites, authentication, authorization, checklist]
---

# Requirements and permissions

Check these requirements before you add your first target. The most important one is knowing exactly how your AI application is reached and how it authenticates requests.

## Account requirements

- A QuilrAI tenant with the Red Teaming module enabled.
- For gateway mode, the target must already be onboarded to the LLM Gateway or MCP Gateway.

## Know your target application

Quilr Red Teaming can only test what it can reach, authenticate to, and talk to in the format the target expects. The team that runs red teaming, usually security, rarely builds the AI applications, agents, and workflows it tests. The details you need sit with the development team that owns each one, so plan to work with them before you add a target.

For each application, agent, or AI workflow, get these five things from its development team:

- **Access:** the endpoint URL, HTTP method, and any network requirements such as VPN or IP allowlisting.
- **Authentication:** how the application verifies the caller, and a valid test credential.
- **Authorization:** the role, permissions, and data the test account is allowed to reach.
- **Request format:** the fields, types, and content type the endpoint accepts.
- **Response format:** where the application's answer, session ID, and actions appear in the reply.

Missing or incorrect details here are the most common cause of setup delays. Authorization matters as much as authentication: the test account's permissions define what the Red Team Agent can attempt, so a test account with too little access hides real risks, and one with too much access can cause real side effects. Agree on the test account's permissions with the development team.

There are two ways to gather this information. Start with the quick path, and move to the detailed checklist when the target needs it.

### Quick path: share one working request

For most targets, one working example answers nearly every question. Ask the development team for a successful API call that includes the authentication method, required headers, request body, and expected response, in any of these forms:

- A working `curl` command
- A Postman collection
- OpenAPI (Swagger) documentation with a working request example

For example, this request to a document summarization API:

```bash
curl -X POST \
  https://documents.example.com/summarize \
  -H "X-API-Key: $API_KEY" \
  -F "file=@sample.pdf"
```

tells Quilr everything it needs to connect:

| Component | Value |
| --- | --- |
| Endpoint | `https://documents.example.com/summarize` |
| HTTP method | `POST` |
| Authentication | API key |
| Authentication header | `X-API-Key` |
| Request format | `multipart/form-data` |
| Required input | `file` (an uploaded document) |

:::warning

Share credentials only through an approved secure channel. Never put real keys or tokens in documentation, tickets, or screenshots. Use a placeholder such as `$API_KEY`, as in the example above.

:::

### Detailed checklist

Use this checklist for targets with custom authentication, short-lived tokens, file uploads, multi-step workflows, or tools and MCP integrations. Share it with the development team that owns the application, agent, or AI workflow, or walk through it with them in a short working session.

| Area | Questions for the development team |
| --- | --- |
| Application access | How is the application reached programmatically? What is the exact endpoint URL and HTTP method? Does access require a VPN, IP allowlisting, private networking, or special TLS certificates? |
| Authentication | Which mechanism does the application use: API key, bearer token, OAuth 2.0, session cookie, Basic authentication, mutual TLS, or none? How will Quilr get valid test credentials, and how are they renewed when they expire? |
| Authorization | What role, permissions, and data access does the test account have? Is it separated from real user data? |
| Request format | Does the endpoint accept JSON, `multipart/form-data`, XML, binary payloads, or WebSocket messages? Which fields are required, and what are their names and types? For file uploads, what is the field name, which file types are supported, and what is the size limit? |
| Response and sessions | What does a successful response look like? Does the application need a session ID, conversation history, or several requests in sequence? For asynchronous workflows, how are results retrieved? |

Response field names are specific to each application. For example, an application might return:

```json
{
  "reply": "Here is the document summary...",
  "session_id": "session-123",
  "actions": []
}
```

Here you map `reply` as the response text and `session_id` as the session value in the target's request and response mapping. See [Red team an agent](../configure-and-run/agent.md).

:::note

The system prompt and tool list are what let the Red Team Agent tailor attacks to the target (a white-box test). Ask the development team for them early. If they cannot be shared, testing still runs as a black-box test, but attacks are less targeted.

:::

### Choose an approach

| Target | Start with |
| --- | --- |
| Simple REST API with straightforward authentication | Quick path |
| The development team already has a working curl command or Postman collection | Quick path |
| Custom authentication or short-lived session tokens | Detailed checklist |
| Document uploads or other multimodal inputs | Detailed checklist |
| Stateful or multi-step workflows | Detailed checklist |
| Agents with tools or MCP integrations | Detailed checklist |
| White-box assessment | Detailed checklist |

### Readiness checks

Before you launch an assessment, confirm each of these with the development team:

| Check | Passes when |
| --- | --- |
| Connectivity | Quilr reaches the application through the intended endpoint. |
| Authentication | The test credential is accepted, or anonymous access is confirmed. |
| Request mapping | Quilr can send every required field in the expected format. |
| Response mapping | Quilr extracts the application's answer from the response. |
| Testing authorization | The target, environment, permitted actions, and boundaries are approved. |

:::tip

Send at least one harmless end-to-end request with **Test connection** before you launch an assessment. A successful network connection alone does not mean the application is ready to test.

:::

:::danger

Get written authorization from the owner of every target before you test it, including third-party vendor AI. Testing a system you do not own or operate can breach its terms of service.

:::
