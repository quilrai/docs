---
sidebar_position: 6
sidebar_custom_props:
  icon: KeyRound
---

# AWS Bedrock - Assume Role Setup

Configure an AWS Bedrock-backed API key using IAM role assumption instead of long-lived access keys. Applies to `bedrock`, `anthropic_messages_bedrock`, `bedrock_embeddings`, and `bedrock_rerank` providers.

## Why assume role

With static keys, you paste an AWS access key and secret into the QuilrAI dashboard; those credentials live in your key's provider settings until you rotate them.

With assume role, you hand QuilrAI an IAM **role ARN** plus an **ExternalId**. At request time QuilrAI calls `sts:AssumeRole` on that role using its own gateway IAM user, gets short-lived credentials (default 1 hour), and uses those to call Bedrock. No long-lived AWS secrets leave your account, you can revoke access at any time by deleting or detaching the role, and every call is attributable in CloudTrail via the session name.

ExternalId is required. AWS recommends it for any cross-account role assumption scenario to prevent the [confused-deputy problem](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html), and a multi-tenant gateway assuming a customer-owned role is exactly that scenario.

## What QuilrAI gives you

QuilrAI's gateway runs under a dedicated IAM user whose only permission is `sts:AssumeRole`. Copy its ARN - you will paste it into the trust policy of the IAM role you create in step 2.

<CopyFieldGroup
  tone="aws"
  fields={[
    {
      label: 'QuilrAI gateway IAM user ARN',
      icon: 'user',
      value: 'arn:aws:iam::975050335771:user/quilr-gateway',
      hint: 'Goes in Principal.AWS of your role trust policy.',
    },
    {
      label: 'QuilrAI AWS account ID',
      icon: 'account',
      value: '975050335771',
      hint: 'Same account as the ARN above. Useful if your review process asks for the account ID on its own.',
    },
  ]}
/>

## 1. Pick an ExternalId

Generate a random, unguessable string - a UUID works. It doesn't need to be secret but it must be unique per role and not predictable.

```sh
uuidgen
# or
python -c "import uuid; print(uuid.uuid4())"
```

Save it - you'll paste it in two places: the role's trust policy (step 2) and the QuilrAI API key form (step 4).

## 2. Create the IAM role in your AWS account

<ConsolePath
  tone="aws"
  console="AWS Console"
  href="https://console.aws.amazon.com/iam/home#/roles"
  path={['IAM', 'Roles']}
  action="Create role"
  note="IAM is global, so the region selector does not matter here. You need iam:CreateRole and iam:PutRolePolicy permissions."
/>

Exact steps in the Create role wizard:

1. **Select trusted entity**: choose **Custom trust policy**
2. Replace the editor contents with the JSON below, substituting your ExternalId from step 1
3. Click **Next** (skip permissions for now - you attach the Bedrock policy in step 3)
4. **Role name**: `quilr-gateway-bedrock`
5. Click **Create role**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::975050335771:user/quilr-gateway"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "<YOUR-EXTERNAL-ID>"
        }
      }
    }
  ]
}
```

## 3. Attach a Bedrock permissions policy

<ConsolePath
  tone="aws"
  console="AWS Console"
  href="https://console.aws.amazon.com/iam/home#/roles"
  path={['IAM', 'Roles', 'quilr-gateway-bedrock', 'Permissions tab', 'Add permissions']}
  action="Create inline policy"
/>

Exact steps:

1. In the policy editor, switch to the **JSON** tab
2. Replace the contents with the policy below
3. Click **Next**, name it `quilr-gateway-bedrock-invoke`, then click **Create policy**

Minimum for chat:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    }
  ]
}
```

The same `bedrock:InvokeModel` action also covers OpenAI-compatible chat through Bedrock `Converse`, boto3 Runtime `converse` / `invoke_model`, Titan embeddings, and Cohere / Amazon rerank models, so one role can serve all Bedrock provider types.

:::note Non-foundation-model resources
The `arn:aws:bedrock:*::foundation-model/*` resource only covers on-demand foundation models. If you use any of the following, add their ARNs to the `Resource` array:

- **Inference profiles** (required for cross-region inference on newer Claude models): `arn:aws:bedrock:*:<YOUR-ACCOUNT-ID>:inference-profile/*`
- **Provisioned Throughput**: `arn:aws:bedrock:*:<YOUR-ACCOUNT-ID>:provisioned-model/*`
- **Custom models**: `arn:aws:bedrock:*:<YOUR-ACCOUNT-ID>:custom-model/*`
:::

Then copy the role ARN from the role's **Summary** panel - the copy icon sits next to the ARN at the top of the page.

<ConsolePath
  tone="aws"
  console="AWS Console"
  href="https://console.aws.amazon.com/iam/home#/roles"
  path={['IAM', 'Roles', 'quilr-gateway-bedrock', 'Summary']}
  action="Copy ARN"
  note="The ARN follows the shape below, with your own 12-digit AWS account ID."
/>

<CopyField
  tone="aws"
  icon="arn"
  label="Role ARN shape"
  value="arn:aws:iam::<YOUR-ACCOUNT-ID>:role/quilr-gateway-bedrock"
  hint="Copy your real ARN from the console rather than editing this template by hand."
/>

## 4. Enter these values in the QuilrAI dashboard

<ConsolePath
  console="QuilrAI dashboard"
  path={['LLM Gateway']}
  action="Create New Key"
  note="Editing an existing Bedrock key works too - open it and switch its authentication mode to Assume Role."
/>

Select the Bedrock provider, set **Authentication** to **Assume Role**, and provide:

### Required

| Field | Source | Example |
|-------|--------|---------|
| `aws_role_arn` | Role ARN from step 3 | `arn:aws:iam::123456789012:role/quilr-gateway-bedrock` |
| `aws_external_id` | UUID from step 1 | `7f3c2b1e-acme-2026` |
| `aws_region` | Your Bedrock region | `us-east-1` (default - check [Bedrock model availability](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html); newer models often land in `us-west-2` first) |

### Optional

| Field | Default | Notes |
|-------|---------|-------|
| `aws_role_session_name` | `quilr-gateway-<timestamp>` | 2–64 chars, pattern `[\w+=,.@-]`. Shows up in CloudTrail and in the assumed-role `aws:PrincipalArn`. |
| `aws_session_duration_seconds` | `3600` | Integer between `900` (15 min) and `43200` (12 hr). Must be ≤ the role's `MaxSessionDuration`. |

### Fields to **not** send in assume-role mode

These belong to the static-key path and will be rejected:

- `aws_access_key`
- `aws_secret_key`
- `aws_session_token`

## 5. Verify before going live

<ConsolePath
  console="QuilrAI dashboard"
  path={['LLM Gateway', 'your key']}
  action="Save"
  note="Then send a test request through the key."
/>

If the role, ExternalId, and permissions are correct, the request succeeds; otherwise the error surfaces directly in the dashboard and maps to the [troubleshooting table below](#troubleshooting).

### Optional: local CLI check

You **cannot** run `aws sts assume-role` against this role from your own terminal as written - the trust policy in step 2 pins the `Principal` to `arn:aws:iam::975050335771:user/quilr-gateway`, so AWS denies any caller that isn't the QuilrAI gateway user before it even looks at the ExternalId.

If you still want to exercise the trust policy locally, temporarily add your own IAM user or role to the `Principal.AWS` array:

```json
"Principal": {
  "AWS": [
    "arn:aws:iam::975050335771:user/quilr-gateway",
    "arn:aws:iam::<YOUR-ACCOUNT>:user/<your-iam-user>"
  ]
}
```

Then run:

```sh
aws sts assume-role \
  --role-arn arn:aws:iam::<YOUR-ACCOUNT>:role/quilr-gateway-bedrock \
  --role-session-name test
# Should fail with AccessDenied (ExternalId condition not satisfied).

aws sts assume-role \
  --role-arn arn:aws:iam::<YOUR-ACCOUNT>:role/quilr-gateway-bedrock \
  --role-session-name test \
  --external-id <YOUR-EXTERNAL-ID>
# Should succeed.
```

If the first call succeeds, the trust policy is missing the ExternalId condition - fix it before using the role. **Remove your own ARN from the `Principal` block before going live** so only the QuilrAI gateway user can assume the role.

## How the gateway uses these values at runtime

1. For each Bedrock request, the gateway calls `sts:AssumeRole` on your role using its own base IAM user, passing your `aws_role_arn`, `aws_external_id`, `aws_role_session_name`, and `aws_session_duration_seconds`.
2. The resulting temporary credentials are cached in-process and auto-refreshed before expiry, so the STS call cost is amortized across many requests.
3. The Bedrock client is built with those temporary credentials and makes the actual boto3 Runtime / Anthropic Messages / embeddings / rerank call.

## Troubleshooting

| Error | Cause |
|-------|-------|
| `Missing required field: aws_external_id` | Assume-role mode requires ExternalId. Generate one (step 1) and put it in both the role's trust policy and the API key form. |
| `sts:AssumeRole failed: ... is not authorized to perform: sts:AssumeRole on resource: ...` | The trust policy does not list `arn:aws:iam::975050335771:user/quilr-gateway` as a principal, or the ExternalId in the API key doesn't match the policy condition. |
| `sts:AssumeRole failed: The requested DurationSeconds exceeds the MaxSessionDuration set for this role` | Lower `aws_session_duration_seconds` or raise the role's `MaxSessionDuration` in the AWS console. |
| `aws_session_duration_seconds must be between 900 and 43200` | AWS limits. Use an integer in that range. |
| `aws_role_session_name must be 2-64 characters matching [\w+=,.@-]` | Stick to alphanumerics, `_`, `+`, `=`, `,`, `.`, `@`, `-`. |
| `AccessDeniedException` on `InvokeModel` | The role's permissions policy (step 3) doesn't allow the Bedrock action or the specific model. |

## References

- [`sts:AssumeRole` API](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)
- [Third-party role access / external IDs](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html)
- [Confused deputy guidance](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html)
- [Bedrock `InvokeModel`](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModel.html)
