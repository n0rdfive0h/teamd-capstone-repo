# Product Outcome

## Primary Users

- Agent
- Manager
- Operator

## Journeys

- Search for existing customers (Amina and/or Ravi)
- View profile
- Record and log interactions
- Change status (within scope)

## In-Scope Capabilities vs Explicit Exclusions

### Capabilities

### Exclusions

## Success Measures (Tied to lab 52)

## Questions with owners and due dates

# System Context View

```mermaid
graph TB
    subgraph Users["People"]
        agent["Service Agent"]
        manager["Manager"]
        operator["Platform Operator"]
    end

    subgraph InScope["In Scope"]
        crm["CRM Platform"]
    end

    subgraph External["External Systems"]
        identity["Identity Provider<br/>(AuthN/AuthZ)"]
        gateway["Email/SMS Gateway<br/>(optional)"]
    end

    agent -->|HTTPS| crm
    manager -->|HTTPS| crm
    operator -->|HTTPS admin| crm
    crm -->|OIDC/JWT| identity
    crm -->|HTTPS| gateway
```
