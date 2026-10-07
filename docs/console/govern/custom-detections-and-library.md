---
sidebar_position: 5
sidebar_label: "Custom detections and library"
sidebar_custom_props:
  icon: LibraryBig
---

# Custom detections and library

When the built-in [Detection Models](./detection-models) do not cover what you need caught, such as an internal project codename, a customer ID format or a topic you want to keep out of AI tools, add a custom detection model. You can install a pre-built one from the **Detection library** or build your own with the **Detection Model builder**.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Detection Models', 'Data Risks', 'Custom']} />

## Detection types

| Type | How it matches | Good for |
|---|---|---|
| **Precision** | Deterministic patterns (regex) | Identifiers with a fixed shape: employee IDs, ticket numbers, internal hostnames |
| **Semantic** | Meaning of the text rather than its exact form | Content that is phrased in many ways |
| **Intent** | What the user is trying to do, described in plain language and steered by examples | Requests such as competitor comparisons or asking for legal advice |

The **Custom** view shows how many models of each type you have, with a card per model offering **Edit & test** and **Delete**.

## Detection library

The **Detection library** drawer holds about 140 pre-built Precision and Intent models.

1. Open **Detection library** from the Custom view.
2. Search or filter for what you need.
3. Select **Try** to test a model against sample text.
4. Select **Install** to add it to your tenant. Installed models appear in the Custom view (**View in Custom**).

## Detection Model builder

The builder turns a plain-language brief into a detection model.

1. Open the **Detection Model builder** from the Custom view.
2. Write a brief describing what to detect, for example "internal project codenames that start with PRJ- followed by four digits".
3. Choose **Quick** or **Advanced** mode, then select **Start building**.
4. The builder suggests a model type (Precision for fixed patterns, Intent for behaviour) and drafts it.
5. Test the draft against sample text, including near misses that should not match.
6. Save the model when the results are right.

Builds run in the background and are listed under builder runs, so you can leave the page and come back.

:::tip Test before you enforce
Add negative examples that are close to the positive ones. Then use the new detection in a policy on **Monitor** first, review the findings for a few days, and only then move to redact or block.
:::

## Use a custom detection

Custom models appear in the **Custom** group of the data type picker on the **Data & Adversarial Risks** card in the [Policy Engine](./policy-engine), so a policy can give them their own action, threshold, stage and scope. LLM Gateway apps can also hold app-level custom detections; see [LLM Gateway custom detections](../../llm-gateway/protect/custom-detections).

## From red team findings

Red Teaming reports can suggest custom detections that would stop the attacks they found, with patterns and a suggested action. Add them here, then use them in a policy. See [Turn findings into detections](../../red-teaming/operate/turn-findings-into-detections).
