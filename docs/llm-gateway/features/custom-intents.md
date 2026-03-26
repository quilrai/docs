---
sidebar_position: 5
---

# Custom Intents

Define your own detection categories with examples.

## Overview

Custom intents extend the guardrails system with your own detection logic. Provide a name, description, and example prompts (both positive matches and negative non-matches) to train a lightweight classifier. Once created, your intent runs on every request alongside the built-in categories.

## Key Features

- Create custom detection intents with positive and negative examples
- Intents are evaluated alongside built-in guardrails
- Assign block, monitor, or redact actions per intent

## How It Works

1. **Name** your intent (e.g., `competitor-mentions`)
2. **Describe** what the intent should detect
3. **Add positive examples** — prompts that should trigger the intent
4. **Add negative examples** — prompts that should not trigger the intent
5. **Assign an action** — block, monitor, or redact

The classifier learns from your examples and applies the configured action when a match is detected.
