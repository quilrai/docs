---
sidebar_position: 8
sidebar_label: "Error messages"
sidebar_custom_props:
  icon: MessageSquareText
description: "Replace matching gateway and provider error messages with useful guidance and a help link without changing status or error codes."
console_path: []
aliases: [error messages, custom errors, help link, client error response]
---

# Error messages

Updated on 3 November 2026.

Give callers a clear explanation and a help link when a gateway or provider request fails. **Error Messages** changes the message and help link, while preserving the HTTP status and error code.

This is a Policy Engine control. There is no equivalent classic app setting.

## Add an error message

1. Open **Govern > Policy Engine > LLM Gateway > Controls > Error Messages**.
2. Start from a recipe, such as **Explain provider problems**, **Explain blocked requests**, or **Keep the error, add our help link**. Use the section's add menu for another setup.
3. Choose **Applies to**, the errors to match, and the message or help link to return. A link is required for the help-link-only recipe.
4. Check **Reads as**, then **Save to draft**.
5. Review the draft and choose **Review & publish** to apply the changes.

Other recipes cover prompts that are too long, credential or model errors, and provider safety refusals. Use wording that tells a caller what they can do next; keep credentials and internal system details out of messages and links.

## Which message wins

Message lists are evaluated by their stored priority, highest first. Every list has a unique priority. Within a list, messages keep their stored order and the first match wins. If no message matches, the caller receives the original error.

## Errors this control does not replace

- Errors before the gateway identifies the app, such as a wrong API key.
- Limit refusals that use a **Limit response**. A budget limit message takes precedence for those refusals; configure it under [Budgets & Usage Limits](../cost-and-traffic/rate-token-and-budget-limits).

Replacing a message does not retry a request, change policy enforcement, or turn a failed call into a successful one.

## Related

- [Rate, token and budget limits](../cost-and-traffic/rate-token-and-budget-limits)
- [Routing and failover](../cost-and-traffic/routing-and-fallbacks)
- [Author, simulate and publish](../../console/govern/author-simulate-and-publish)
