# Design Containers and Data Flow

```mermaid
flowchart LR
  Agent["Service Agent"] -->|HTTPS| UI["REACT CRM"]
  Manager["Manager"] -->|HTTPS| UI["REACT CRM"]
  Operator["Platform Operator"] -->|HTTPS admin| UI["REACT CRM"]

  UI -->|"REST + JWT"| API["Sprint Boot API"]
  API -->|JPA/JDBC| DB[("PostgreSQL")]
  API -->|"Customer Events"| K[("Kafka")]
  K --> Worker["Notification Consumer"]
  API --> Obs["Logs / Metrics / Traces"]
  Worker --> Obs
  IdP["Identity Provider"] --> |OIDC/JWT| UI
  IdP --> |JWKS| API
```

# Ownership Candidates

- **Customer** - Owned by CustomerService. Authoritative source of truth for customer identity.
- **Notifications** - Estimated to be a future NotificationService. Dependent on the scope of this file
