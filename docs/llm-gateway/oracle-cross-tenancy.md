---
sidebar_position: 7
sidebar_custom_props:
  badge: new
  icon: KeyRound
---

# Oracle OCI - Gateway Sign-In Setup

Connect OCI Generative AI to QuilrAI without giving QuilrAI an Oracle API key or a customer-owned signing key. Your OCI administrator creates a cross-tenancy policy that admits QuilrAI's gateway IAM group, and QuilrAI signs each request using its own OCI identity.

This setup supports:

- OpenAI-compatible Chat Completions through the `oracle` provider
- OpenAI-compatible Responses through the `oracle_responses` provider

## What QuilrAI gives you

Use these public OCIDs in your OCI policy:

| Resource | OCID |
|----------|------|
| QuilrAI tenancy | `ocid1.tenancy.oc1..aaaaaaaabcp64qggjkgspajuc3o5a66t6isnz5rudglu5vnmft3apun4mevq` |
| QuilrAI gateway IAM group | `ocid1.group.oc1..aaaaaaaajwg3vbuahquqywu46gx6xv23a6yiyb4lf3bbedxnguvvncq3tnlq` |

These OCIDs identify QuilrAI to Oracle. They are not credentials and cannot be used to sign requests.

## 1. Choose the access scope

Both scopes work with the same QuilrAI API key configuration:

| Scope | When to use it | OCI policy location |
|-------|----------------|---------------------|
| One compartment | Recommended. Limits QuilrAI to Generative AI resources in the selected compartment. | Root compartment of your tenancy |
| Entire tenancy | Simpler when Generative AI projects span several compartments. Covers current and future compartments. | Root compartment of your tenancy |

The scope is controlled entirely by your OCI policy. You do not select tenancy-wide or compartment-only access in the QuilrAI dashboard. In both cases, you enter the specific project and compartment that each QuilrAI provider should use.

:::warning Use the smallest practical scope
Tenancy-wide access is supported, but it grants the QuilrAI gateway group access to eligible Generative AI resources across your tenancy. Prefer a dedicated compartment when your OCI structure permits it.
:::

## 2. Create the cross-tenancy policy

In the OCI Console, go to **Identity & Security → Policies**, select the **root compartment**, and create a policy such as `quilr-generative-ai-access`.

### Recommended: one compartment

Replace `<YOUR-GENERATIVE-AI-COMPARTMENT-NAME>` with the compartment containing your Generative AI project:

```text
Define tenancy QuilrAI as ocid1.tenancy.oc1..aaaaaaaabcp64qggjkgspajuc3o5a66t6isnz5rudglu5vnmft3apun4mevq
Define group QuilrGateway as ocid1.group.oc1..aaaaaaaajwg3vbuahquqywu46gx6xv23a6yiyb4lf3bbedxnguvvncq3tnlq

Admit group QuilrGateway of tenancy QuilrAI to use generative-ai-family in compartment <YOUR-GENERATIVE-AI-COMPARTMENT-NAME>
Admit group QuilrGateway of tenancy QuilrAI to manage generative-ai-response in compartment <YOUR-GENERATIVE-AI-COMPARTMENT-NAME>
```

### Alternative: entire tenancy

```text
Define tenancy QuilrAI as ocid1.tenancy.oc1..aaaaaaaabcp64qggjkgspajuc3o5a66t6isnz5rudglu5vnmft3apun4mevq
Define group QuilrGateway as ocid1.group.oc1..aaaaaaaajwg3vbuahquqywu46gx6xv23a6yiyb4lf3bbedxnguvvncq3tnlq

Admit group QuilrGateway of tenancy QuilrAI to use generative-ai-family in tenancy
Admit group QuilrGateway of tenancy QuilrAI to manage generative-ai-response in tenancy
```

The `generative-ai-family` statement enables Generative AI access, including Chat Completions. The `generative-ai-response` statement enables the Responses API.

:::note Chat-only access
If you will use only Chat Completions, omit the `generative-ai-response` statement.
:::

## 3. Collect your Oracle target values

You need these non-secret values from OCI:

| QuilrAI field | Where to find it | Required |
|---------------|------------------|----------|
| OCI region | Region containing your Generative AI project, for example `us-chicago-1` | Always |
| Project OCID | Generative AI → Projects → your project | Always |
| Compartment OCID | Identity & Security → Compartments → your compartment | Chat Completions; recommended for Responses |
| Model ID | The Oracle model you want to call | Always |

Oracle model discovery is manual in QuilrAI, so copy the exact model ID that is available in the selected region.

## 4. Configure the provider in QuilrAI

Create or update the LLM Gateway API key and add an Oracle provider.

### Chat Completions

| Field | Value |
|-------|-------|
| Provider | Oracle |
| Authentication | Gateway sign-in / `gateway_user_principal` |
| OCI region | Your Oracle region |
| Project OCID | Your Generative AI project OCID |
| Compartment OCID | Your compartment OCID |
| Selected models | One or more Oracle model IDs |

### Responses

| Field | Value |
|-------|-------|
| Provider | Oracle Responses |
| Authentication | Gateway sign-in / `gateway_user_principal` |
| OCI region | Your Oracle region |
| Project OCID | Your Generative AI project OCID |
| Compartment OCID | Recommended; optional for this provider |
| Selected models | One or more Oracle model IDs |

Do not enter an Oracle API key, user OCID, tenancy OCID, fingerprint, private key, session token, or passphrase. QuilrAI supplies its gateway signing identity at request time.

## 5. Verify the connection

Save the provider and run its model validation in the QuilrAI dashboard. A successful validation confirms all of the following:

- The project and compartment IDs are correct
- The model is available in the selected region
- Your Admit policy matches QuilrAI's tenancy and group
- Oracle authorizes the requested API

Policy changes can take a few minutes to propagate. If the first validation fails immediately after creating the policy, wait briefly and retry.

## Revoke access

Delete the Admit policy, or remove its two Admit statements, to revoke QuilrAI's access. No credential rotation is required because no customer signing key was shared.

## Troubleshooting

| Error | Likely cause |
|-------|--------------|
| `NotAuthorizedOrNotFound` or HTTP 404 | The Admit policy is missing, has the wrong QuilrAI OCID, uses the wrong compartment, or has not propagated yet. Oracle can mask authorization failures as not-found responses. |
| HTTP 401 | Request signing failed. Contact QuilrAI support; customers do not manage the gateway signing key. |
| Project or compartment error | The OCID does not belong to the selected region/scope, or the policy does not cover its compartment. |
| Model not found or unavailable | The model ID is incorrect or is not available in the selected OCI region. |
| Chat works but Responses fails | Add the `manage generative-ai-response` Admit statement. |

## References

- [OCI cross-tenancy policies](https://docs.oracle.com/en-us/iaas/Content/Identity/policieshow/iam-cross-domain.htm)
- [OCI Generative AI IAM policies](https://docs.oracle.com/en-us/iaas/Content/generative-ai/iam-policies.htm)
