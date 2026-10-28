---
sidebar_position: 6.5
sidebar_label: "Model visibility"
sidebar_custom_props:
  icon: EyeOff
description: "Choose which models GET /v1/models and the console's model lookups list, for everyone or a narrower scope, without changing which models can be called."
aliases: [model visibility, model listing, hide models, hidden models, list models, available models, include_hidden]
---

# Model visibility

Choose which models a model list shows. Turn listing off, show only some providers or models, hide models by name, or hide undated aliases, for everyone or for an app, a team or a person. Model visibility is a Policy Engine card. With the engine off, every list shows the models a caller may use, as before.

## Visibility is not access

Hiding a model only takes it off lists. It never blocks a call:

- A hidden model still works by name: in requests, in `GET /v1/models/{id}` and through **Add a model by name**.
- To stop a model from being used, reject it on the [Allowed Models card](./gateway-access-and-allowed-models#allowed-models-card). `GET /v1/models` applies that card first, and never lists a model it rejects, not even to callers who ask for hidden models.

| You want to | Use |
|---|---|
| Keep a model out of pickers and `/v1/models`, while code that names it keeps working | Model Visibility |
| Stop a model from being called | [Allowed Models](./gateway-access-and-allowed-models#allowed-models-card) |
| Stop someone from sending requests at all | [Gateway Access](./gateway-access-and-allowed-models#gateway-access-card) |

## Lists it applies to

| List | Who reads it |
|---|---|
| `GET /openai_compatible/v1/models` and `GET /anthropic_messages/v1/models` | Coding agents such as Cursor and Claude Code, chat front ends such as Open WebUI, and the OpenAI and Anthropic SDKs, calling with an app's Quilr key |
| **Get available models** in an app's providers, and **Check key and list models**, **Get available models** or **List models** when you [add a provider or models](../apps-and-providers/providers-and-models#add-a-provider) | Admins in the console |

Other lists are unchanged: Policy Engine pickers, the **Models** pages and the playground show every configured model.

The two kinds of list start from different places. `GET /v1/models` lists the models the caller may use, after Allowed Models. Console lookups list what the provider key can reach, so you can choose models for a provider; Allowed Models does not apply there, only these rules.

Scopes match like this:

- **People and Smart group:** on `GET /v1/models`, the identity the request carries (a JWT, or `X-User-Email` when the app accepts it; see [Identity and network trust](./identity-and-network-trust)). In the console, the person signed in.
- **Application and App tag:** on `GET /v1/models`, the app whose key made the call. In the console, only **Get available models** on a provider an app already has carries the app. Creating an app, entering new credentials or adding a provider in **Models** carries none, so those rules do not apply there.

## Model Visibility card

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Govern', 'Policy Engine', 'LLM Gateway']}
  action="Model Visibility"
/>

The card sits next to **Allowed Models**. Start from **Quick add** or from a control's add button:

| Quick add | What it sets |
|---|---|
| **Hide preview models** | **Hide** with the model pattern `*preview*` |
| **Only show approved providers** | **Show only** with the providers you pick |
| **Turn off model listing** | **Model listing** set to **Off** |
| **Let admins list hidden models** | **Hidden models** set to **On request** for the people or Smart groups you pick |

Each opens **New model visibility rule**. Choose who it applies to (everyone, or People, Smart group, Department, IdP group, Application or App tag), then what their model lists show:

| Setting | What it does | Not set |
|---|---|---|
| **Model lists** | **Both**, **API (GET /v1/models)** or **Console** | Both |
| **Model listing** | **Off**: lists show nothing. `GET /v1/models` returns an empty list, and the console asks for model names. | On |
| **Show only** | Tick **Show only some models** and add grants. Only models a grant matches are listed. | Every model |
| **Hide** | Tick **Hide some models** and add grants. Models a grant matches are left out, even where a show-only grant matches them. | Nothing hidden |
| **Undated aliases** | **Hide undated aliases**: leave out `gpt-4o` when the same provider also lists `gpt-4o-2024-08-06`. | Listed |
| **Hidden models** | **Never**, **On request** or **Always**: who still sees hidden models, marked as hidden. See [Show hidden models](#show-hidden-models). | Never |

**Add to draft** puts the rule in the shared draft, and it applies once you [publish a revision](../../console/govern/author-simulate-and-publish). The card lists each rule's grants, for example `azureopenai · gpt-4o*`. Editing a rule reopens the same form, or the full editor for a rule the form cannot show.

### Grants

A grant describes a set of models. Fill in one or more of its fields, and use **Add grant** for another set.

| Field | Matches | Example |
|---|---|---|
| **Providers** | The [provider type](../apps-and-providers/providers-and-models#1-connect) | `openai`, `azureopenai`, `bedrock` |
| **Provider labels** | The label saved on a provider | `prod-east` |
| **Model patterns** | The model ID. `*` matches any run of characters and `?` one character. | `gpt-4o*`, `*preview*` |

- A grant matches a model when every field you filled in matches. Inside one field, any value can match.
- **Providers** take the exact provider type: `openai` is OpenAI Chat completions, so an OpenAI Responses provider needs `openai_responses`. The field suggests the types your apps use.
- Matching ignores case. A rule holds up to 16 grants, and a field up to 128 values of up to 256 characters.
- A pattern matches the whole ID: `gpt-4o` matches only `gpt-4o`, while `gpt-4o*` also matches `gpt-4o-mini` and `gpt-4o-2024-08-06`. Use `*preview*` for "contains preview".
- A provider label matches only a saved provider. A provider you are still adding has no label yet, so label grants never match it.

## How rules combine

The gateway builds each list in this order:

1. **Allowed Models** removes the models the caller may not use (on `GET /v1/models` only).
2. **Model listing** set to **Off** by any matching rule empties the list.
3. **Show only**: when matching rules have show-only grants, only the models that match one of them stay.
4. **Hide**: models that match any hide grant are left out, even where a show-only grant matches them.
5. **Undated aliases**: hidden when any matching rule hides them.
6. **Hidden models** decides whether hidden models come back, marked.

- **Grants add up.** Show-only and hide grants from every matching rule combine, whatever their priority. A higher-priority rule cannot take back another rule's show-only grant, so hide what should not be shown instead.
- **Off and hidden always win.** **Model listing Off** and **Hide undated aliases** apply when any matching rule sets them. To exempt a narrower scope, such as admins, set **Hidden models** to **Always** for it.
- **Hidden models follows priority.** The highest-priority setting wins, and at one priority the stricter one wins (**Never**, then **On request**, then **Always**). The form gives a rule for a person, Smart group or app a higher priority than a rule for everyone.
- **One model, two providers.** When two providers offer the same model ID and only one of them is hidden, the list still shows the model, under the provider that is visible.

A model visibility rule holds only model visibility settings, plus its name, priority and risk level. In [Advanced policies](../../console/govern/policy-engine#llm-gateway-and-mcp-gateway), validation rejects a rule that also sets other controls, because other requests would then skip the whole rule. It also rejects conditions a model list never carries: the requested model, prompt text, tools or detected data. It warns when a rule matches on the provider (use a grant's **Providers** instead), on the source IP of a console lookup (that is the console server's address), or hides `*` (set **Model listing** to **Off** instead).

## Show hidden models

**Hidden models** decides who still sees what these rules hide. Hidden models come back marked. A model that Allowed Models rejects never comes back on `GET /v1/models`.

| Hidden models | `GET /v1/models` | Console lookups |
|---|---|---|
| **Never** (the default) | Never listed | Listed only when someone who can view LLM Gateway policies ticks **Show models hidden by policy** |
| **On request** | Listed when the caller asks with `?include_hidden=true` or the `X-Quilr-Include-Hidden: true` header | Same as **Never** |
| **Always** | Always listed | Always listed |

Without **On request** or **Always**, `include_hidden` is ignored: the caller gets the normal list and no error. Each listed hidden model carries `"quilr_visibility": "hidden"`:

```bash
curl "https://guardrails.quilr.ai/openai_compatible/v1/models?include_hidden=true" \
  -H "Authorization: Bearer $QUILR_KEY" \
  -H "X-User-Email: admin@acme.com"
```

```json
{
  "object": "list",
  "data": [
    { "id": "gpt-4.1", "object": "model", "created": 0, "owned_by": "openai" },
    { "id": "gpt-4.1-preview", "object": "model", "created": 0, "owned_by": "openai", "quilr_visibility": "hidden" }
  ]
}
```

In the console, **Show models hidden by policy** appears once a lookup hid something, and only for people whose role lets them view LLM Gateway policies. Hidden models then show as **gpt-4.1-preview · hidden by policy** in an app's providers, or with a **Hidden by policy** tag when you add a provider or models.

## What people see

- **API callers** get fewer entries, in the usual format. With listing off, `data` is an empty list. A hidden model still answers `GET /v1/models/{id}`, while a model the caller may not use returns 404 (`model_not_found` in the OpenAI format).
- **Console lookups** add a line such as "3 models hidden by policy." Hidden models are dropped before the console checks each model with the provider, so they are never called.
- **Nothing left to list.** With listing off, or when no show-only grant can match the provider, the console does not contact the provider. It shows "Model listing is turned off by your organization's policy. Add models by name." or "All models from this provider are hidden by your organization's policy. Add models by name." Type models into **Add a model by name** (or **Add by ID**): each is still checked against the provider, which also checks the key.
- **If the policy cannot be read**, lists show every model the caller may use, as they would without these rules. Visibility is presentation, so it fails open.

## Scenarios

- **Tidy lists for everyone.** Hide `*preview*` and undated aliases for everyone:

<PolicyCard
  name="tidy_model_lists"
  stage="request"
  priority={500}
  when={[]}
  then={[
    { effect: "Hide models", value: "*preview*" },
    { effect: "Hide undated aliases", value: "true" },
  ]}
/>

- **Approved providers only.** Show only `azureopenai` for everyone. A team that also uses Anthropic gets its own show-only grant for `anthropic_messages` on its Smart group, which adds to the first.
- **No model list for one app.** Set **Model listing** to **Off** for an Application whose users pick models from your own approved list. Requests that name a model keep working.
- **Admins see everything.** Set **Hidden models** to **On request** for a Platform admins Smart group. They call `GET /v1/models?include_hidden=true` and see every model they may use, with hidden ones marked:

<PolicyCard
  name="platform_admins_list_hidden_models"
  stage="request"
  priority={900}
  when={[{ field: "Smart groups", op: "includes (ignoring case)", value: "Platform admins" }]}
  then={[{ effect: "Show hidden models", value: "on_request" }]}
/>

- **Coding agents see one family.** For an App tag shared by your coding-agent apps, with **Model lists** set to **API (GET /v1/models)**, show only `azureopenai · gpt-4o*`. Console lookups for those apps are unchanged.
- **Retire a provider's copies.** Hide the provider label `legacy-openai`. Models that another provider also offers stay listed, under that provider.

## Related

- [Gateway access and allowed models](./gateway-access-and-allowed-models)
- [Providers and models](../apps-and-providers/providers-and-models)
- [Identity and network trust](./identity-and-network-trust)
- [Policy Engine overview](../../console/govern/policy-engine)
