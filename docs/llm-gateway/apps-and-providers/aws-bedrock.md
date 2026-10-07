---
sidebar_position: 4
sidebar_label: "AWS Bedrock"
sidebar_custom_props:
  icon: KeyRound
---

# AWS Bedrock

Connect AWS Bedrock to the LLM Gateway with an IAM role instead of long-lived access keys, and call Bedrock through the gateway with `boto3`. Applies to the `bedrock`, `anthropic_messages_bedrock`, `bedrock_embeddings` and `bedrock_rerank` providers.

| Section | Use it when |
|---------|-------------|
| [Connect Bedrock with an assumed role](#connect-bedrock-with-an-assumed-role) | You want QuilrAI to reach Bedrock with short-lived STS credentials. |
| [Call Bedrock with boto3](#call-bedrock-with-boto3) | Your app already uses `bedrock-runtime` and you want to keep AWS request shapes. |

## Connect Bedrock with an assumed role

### Why assume role

With static keys, you paste an AWS access key and secret into the QuilrAI console; those credentials live in the provider settings until you rotate them.

With assume role, you hand QuilrAI an IAM **role ARN** plus an **ExternalId**. At request time QuilrAI calls `sts:AssumeRole` on that role using its own gateway IAM user, gets short-lived credentials (default 1 hour), and uses those to call Bedrock. No long-lived AWS secrets leave your account, you can revoke access at any time by deleting or detaching the role, and every call is attributable in CloudTrail via the session name.

ExternalId is required. AWS recommends it for any cross-account role assumption scenario to prevent the [confused-deputy problem](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html), and a multi-tenant gateway assuming a customer-owned role is exactly that scenario.

### What QuilrAI gives you

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

### 1. Pick an ExternalId

Generate a random, unguessable string - a UUID works. It doesn't need to be secret but it must be unique per role and not predictable.

```sh
uuidgen
# or
python -c "import uuid; print(uuid.uuid4())"
```

Save it - you'll paste it in two places: the role's trust policy (step 2) and the QuilrAI provider form (step 4).

### 2. Create the IAM role in your AWS account

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

### 3. Attach a Bedrock permissions policy

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

### 4. Enter these values in QuilrAI

<ConsolePath
  console="QuilrAI console"
  path={['Settings', 'AI Gateway', 'Models']}
  action="Add your own models"
  note="Or add Bedrock as app-only credentials in Create App. See Providers and models."
/>

Select the **Amazon Bedrock** tile, set **Authentication** to **Assume Role**, and provide:

#### Required

| Field | Source | Example |
|-------|--------|---------|
| `aws_role_arn` | Role ARN from step 3 | `arn:aws:iam::123456789012:role/quilr-gateway-bedrock` |
| `aws_external_id` | UUID from step 1 | `7f3c2b1e-acme-2026` |
| `aws_region` | Your Bedrock region | `us-east-1` (default - check [Bedrock model availability](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html); newer models often land in `us-west-2` first) |

#### Optional

| Field | Default | Notes |
|-------|---------|-------|
| `aws_role_session_name` | `quilr-gateway-<timestamp>` | 2–64 chars, pattern `[\w+=,.@-]`. Shows up in CloudTrail and in the assumed-role `aws:PrincipalArn`. |
| `aws_session_duration_seconds` | `3600` | Integer between `900` (15 min) and `43200` (12 hr). Must be ≤ the role's `MaxSessionDuration`. |

#### Fields to **not** send in assume-role mode

These belong to the static-key path and will be rejected:

- `aws_access_key`
- `aws_secret_key`
- `aws_session_token`

### 5. Verify before going live

Save the provider, then send a test request through an app that uses it. If the role, ExternalId, and permissions are correct, the request succeeds; otherwise the error surfaces directly in the console and maps to the [troubleshooting table below](#assume-role-troubleshooting).

#### Optional: local CLI check

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

### How the gateway uses these values at runtime

1. For each Bedrock request, the gateway calls `sts:AssumeRole` on your role using its own base IAM user, passing your `aws_role_arn`, `aws_external_id`, `aws_role_session_name`, and `aws_session_duration_seconds`.
2. The resulting temporary credentials are cached in-process and auto-refreshed before expiry, so the STS call cost is amortized across many requests.
3. The Bedrock client is built with those temporary credentials and makes the actual boto3 Runtime / Anthropic Messages / embeddings / rerank call.

### Assume-role troubleshooting

| Error | Cause |
|-------|-------|
| `Missing required field: aws_external_id` | Assume-role mode requires ExternalId. Generate one (step 1) and put it in both the role's trust policy and the provider form. |
| `sts:AssumeRole failed: ... is not authorized to perform: sts:AssumeRole on resource: ...` | The trust policy does not list `arn:aws:iam::975050335771:user/quilr-gateway` as a principal, or the ExternalId in the provider settings does not match the policy condition. |
| `sts:AssumeRole failed: The requested DurationSeconds exceeds the MaxSessionDuration set for this role` | Lower `aws_session_duration_seconds` or raise the role's `MaxSessionDuration` in the AWS console. |
| `aws_session_duration_seconds must be between 900 and 43200` | AWS limits. Use an integer in that range. |
| `aws_role_session_name must be 2-64 characters matching [\w+=,.@-]` | Stick to alphanumerics, `_`, `+`, `=`, `,`, `.`, `@`, `-`. |
| `AccessDeniedException` on `InvokeModel` | The role's permissions policy (step 3) doesn't allow the Bedrock action or the specific model. |

### AWS references

- [`sts:AssumeRole` API](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)
- [Third-party role access / external IDs](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html)
- [Confused deputy guidance](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html)
- [Bedrock `InvokeModel`](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InvokeModel.html)

## Call Bedrock with boto3

This mode is for applications that already use `bedrock-runtime` directly and want to keep AWS request shapes such as `converse`, `converse_stream`, and `invoke_model`.

If your application uses OpenAI-compatible clients, you can use the same `bedrock` provider key with `/openai_compatible/v1/chat/completions` instead. QuilrAI translates the OpenAI-compatible chat request to Bedrock `Converse`, so OpenAI SDKs and wrappers can call selected Bedrock models without boto3. See [Unified Completions](../api-reference/unified-completions) for the compatibility contract.

### What is supported

| boto3 operation | Gateway path | Guardrail coverage |
|-----------------|--------------|--------------------|
| `converse` | `/bedrock-runtime/model/{model_id}/converse` | Request and response DLP |
| `converse_stream` | `/bedrock-runtime/model/{model_id}/converse-stream` | Request DLP, raw EventStream response passthrough |
| `invoke_model` | `/bedrock-runtime/model/{model_id}/invoke` | Request and response DLP for supported text schemas |
| `invoke_model_with_response_stream` | `/bedrock-runtime/model/{model_id}/invoke-with-response-stream` | Not enabled yet; returns `ValidationException` |

The same routes are also available without the `/bedrock-runtime` prefix, for example `/model/{model_id}/converse`.

Only Bedrock Runtime is proxied. The Bedrock control plane and Bedrock Agent Runtime are not proxied.

### Create the gateway app

Create an LLM Gateway app with an Amazon Bedrock provider (`bedrock`).

Configure AWS access with either static credentials or assume role:

| Auth mode | Required fields | Optional fields |
|-----------|-----------------|-----------------|
| Static AWS keys | `aws_access_key`, `aws_secret_key` | `aws_region`, `aws_session_token` |
| Assume role | `aws_role_arn`, `aws_external_id` | `aws_region`, `aws_role_session_name`, `aws_session_duration_seconds` |

For assume-role setup, see [Connect Bedrock with an assumed role](#connect-bedrock-with-an-assumed-role).

### Configure boto3

Set `endpoint_url` to the closest regional QuilrAI Bedrock Runtime endpoint. Use the app's QuilrAI key (`sk-quilr-...`) for both `aws_access_key_id` and `aws_secret_access_key`; the gateway uses SigV4 to authenticate the request.

```python
import boto3
from botocore.config import Config

QUILR_KEY = "sk-quilr-xxx"

bedrock = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1",
    endpoint_url="https://guardrails-usa-2.quilr.ai/bedrock-runtime",
    aws_access_key_id=QUILR_KEY,
    aws_secret_access_key=QUILR_KEY,
    config=Config(read_timeout=300),
)

response = bedrock.converse(
    modelId="amazon.nova-lite-v1:0",
    messages=[
        {
            "role": "user",
            "content": [{"text": "Hello!"}],
        }
    ],
    inferenceConfig={"maxTokens": 256},
)

print(response["output"]["message"]["content"][0]["text"])
```

You can also set `endpoint_url` to the service root:

```python
endpoint_url="https://guardrails-usa-2.quilr.ai"
```

Both endpoint styles are accepted.

### InvokeModel example

`invoke_model` keeps the provider-native Bedrock JSON body. QuilrAI supports deterministic text schemas for Amazon Nova, Anthropic, and OpenAI-style Bedrock models.

```python
import json

body = {
    "messages": [
        {
            "role": "user",
            "content": [{"text": "Summarize how guardrails work in one sentence."}],
        }
    ],
    "inferenceConfig": {"maxTokens": 256},
}

response = bedrock.invoke_model(
    modelId="amazon.nova-lite-v1:0",
    body=json.dumps(body),
    contentType="application/json",
    accept="application/json",
)

payload = json.loads(response["body"].read())
print(payload)
```

### ConverseStream example

`converse_stream` is proxied as raw AWS EventStream after request-side DLP succeeds. QuilrAI logs stream byte count, event count, usage, and best-effort text, but it does not run response-side DLP on stream chunks.

```python
stream = bedrock.converse_stream(
    modelId="amazon.nova-lite-v1:0",
    messages=[
        {
            "role": "user",
            "content": [{"text": "Write a short haiku about logging."}],
        }
    ],
)

for event in stream["stream"]:
    delta = event.get("contentBlockDelta", {}).get("delta", {})
    text = delta.get("text")
    if text:
        print(text, end="")
```

### Supported model coverage

`converse` can call any selected Bedrock model that supports the Bedrock `Converse` API, including inference profile IDs supported by Bedrock.

`invoke_model` keeps provider-native Bedrock JSON bodies, so QuilrAI only parses deterministic text schemas for these Bedrock families:

- Amazon Nova (`amazon.nova-*`)
- Anthropic (`anthropic.*`)
- OpenAI-style Bedrock models (`openai.*`)

For `invoke_model`, inference profile IDs are accepted when they resolve to one of these families, including region-prefixed profile IDs such as `us.anthropic...`.

Unknown `invoke_model` families are rejected instead of being parsed best-effort. This keeps DLP behavior deterministic for every supported request and response schema.

### Guardrail behavior

For non-streaming `converse` and supported `invoke_model` calls, QuilrAI scans user text before the upstream Bedrock call and scans text in the Bedrock response before returning it.

For `converse_stream`, QuilrAI scans user text before opening the upstream stream. The response stream is passed through unchanged.

Bedrock-native guardrail passthrough is not supported on this surface. Requests that include `x-amzn-bedrock-guardrailidentifier`, `x-amzn-bedrock-guardrailversion`, `guardrailConfig`, or `amazon-bedrock-guardrailConfig` are rejected with `ValidationException`. Configure QuilrAI guardrails on the app instead.

### boto3 troubleshooting

| Error | Cause |
|-------|-------|
| `UnrecognizedClientException` | The SigV4 access key ID is missing, invalid, or is not a `sk-quilr-*` key. |
| `SignatureDoesNotMatch` | The request was not signed for the `bedrock` service, the host changed after signing, or the key/secret values differ. |
| `AccessDeniedException` | The model is not selected on the gateway app. |
| `ValidationException` for `invoke_model` model family | The model is not in a supported `invoke_model` text family. Use `converse` or OpenAI-compatible chat for Converse-capable models. |
| `ValidationException` for guardrails | Bedrock-native guardrail headers/body fields were sent. Use QuilrAI guardrail settings instead. |
| `ModelTimeoutException` | The upstream Bedrock Runtime request timed out. |
