---
sidebar_position: 2
sidebar_label: "From MLflow"
sidebar_custom_props:
  icon: Database
description: "Connect an MLflow or Databricks tracking server and choose which registered models Drift & Bias monitors."
aliases: [MLflow, Databricks, model registry, refresh models, registered models]
---

# Connect an MLflow registry

Connect your MLflow tracking server or Databricks workspace, and Drift & Bias reads its registered models, versions, training runs, dataset inputs and feature importance. The connection is read only: model files and datasets are never downloaded.

## Connect the server

1. Open **Settings** > **Integrations** and find **MLflow** in the **Library**. You can also select **Open Integrations** from the **Add an ML model** panel on the **ML models** tab.
2. Add the connection for your tracking server. It can sign in with a token, a username and password, or no sign-in. Credentials are stored encrypted.
3. Select **Check access** to confirm QuilrAI can reach it.

The connected server shows its address, authentication, the number of registered models and when it was **Last refreshed**, with a **Connected** badge.

## Choose the models to monitor

![MLflow integration panel with the connection and the registered models to monitor](/img/drift-and-bias/15-mlflow.jpg)

*Figure 1. The MLflow integration: connection and registered models.*

Under **Registered models**, the **MLflow registered models and monitoring** table lists every registered model with its key, **Latest version**, **Versions** and **Last seen**.

Select **Monitor** for each model you want Drift & Bias to check. Versions and training runs are read only for monitored models.

## When models are read

- Every 6 hours, automatically.
- At once, when you select **Refresh models**.

Version aliases such as `champion` show on each version, and training runs show their MLflow run names.

A model can come from MLflow and from a pipeline at the same time. Its **Source** on the **ML models** tab then shows **Pipeline + MLflow**.

## Next steps

- [ML models tab](../monitor-ml-models/ml-models-tab.md)
- [Model page](../monitor-ml-models/model-page.md)
