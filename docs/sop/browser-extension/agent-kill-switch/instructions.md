---
sidebar_position: 1
sidebar_custom_props:
  icon: ClipboardList
---

Go to https://github.com/quilrbusiness/ConstantsConfigsSync

Make changes in the tenant specific json file in `constants/defaults/abc-...json`

Raise a PR to main

Contact Kashi or Thiru for PR approval and merge.

Note: We can find tenant ID in browser extension API calls.

## Step 1 – Create a branch from main

Pull the latest main, then create a new branch named like:

```
feat/disable-agent-kill-switch
```

## Step 2 – Add your constant

If the constant is for all tenants, add it to `default.json`.

`default.json`

```json
{
  "disable_agent": true
}
```

If the constant is tenant-specific, add or override it inside:

`constants/tenants/<tenant-uuid>.json`

Example: `442e052d-4c60-4cdc-961e-bc9db74a40ca.json`

```json
{
  "disable_agent": true
}
```

- Tenant value overrides the global value for that tenant only
- Other tenants continue using `default.json`
- If the tenant file doesn't exist, create it using the tenant UUID


## Step 3 – Commit & push

Stage only the files under `constants` that you changed.

Example commit messages:

```
feat: add disable_agent constant globally
feat: override disable_agent for tenant 442e052d
```

Push your branch.

## Step 4 – Raise a PR

Create a Pull Request to main. In the PR description include:

- What `disable_agent` does
- Whether it's global or tenant-specific
- Tenant UUID (if applicable)
