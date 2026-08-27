# Demo script — Northstar CRM final defense

**Total target:** ~10–12 minutes live (+ 1 deny/failover beat)  
**Fixtures:** `CUS-1001` Amina · `CUS-1002` Ravi · `lab-request-001`  
**Roles:** Driver (UI) · Narrator · Verifier (API/SQL/logs)

## Pre-flight (T-5 min)

- [ ] UI URL: _____
- [ ] API health: _____
- [ ] Auth token ready (do not paste into slides)
- [ ] Fallback screenshots folder: `notes/screenshots/lab-52/fallback/`

## Happy path

| Min | Beat | Who | Say / do | Pass signal |
| --- | ---- | --- | -------- | ----------- |
| 0:00 | Hook | Narrator | Business outcome in one sentence | Panel nods |
| 0:30 | Search | Driver | Search Amina `CUS-1001` | Profile opens |
| 1:30 | Timeline | Driver | Show existing interactions | List renders |
| 2:30 | Create | Driver | Record interaction; correlation `lab-request-001` | 201 / UI success |
| 4:00 | Persist | Verifier | SQL or admin proof of row | Row exists |
| 5:00 | Event | Verifier | Kafka / log shows event + correlation | Message visible |
| 6:30 | Secondary | Driver | Brief Ravi `CUS-1002` mention | Optional |
| 7:30 | Release | Narrator | Cite image digest + pipeline | Digest on slide |

## Deny / failure beat (required)

| Min | Beat | Who | Say / do | Pass signal |
| --- | ---- | --- | -------- | ----------- |
| 8:30 | Unauthorized | Verifier | Call API without token | **401** |
| 9:00 | Forbidden | Verifier | Wrong role (if available) | **403** |
| 9:30 | Recovery | Narrator | If live fails → open fallback screenshots; be transparent | Continuity |

## Close

- Residual risks owned: 
> - Reliance on fixtures (No true owner).
> - InteractionType not validated (Backend).
> - Actor/Agent is a placeholder, no true identity (Backend).
> - Testcontainers/Docker Desktop/Windows incompatibility (Backend).
> - 
- What we would do with one more week: 
> - Tailor the app for creation of real data, less reliant on fixtures.
> - Add a stylized interactions table or graph.

## Script notes / TODOs

- Exact curl commands:
 ```powershell
  # Create an interaction (Amina)
  curl -i -X POST "http://localhost:8080/api/v1/interactions" \
    -H "Content-Type: application/json" \
    -H "X-Correlation-ID: lab-request-001" \
    -d '{"customerId":"CUS-1001","interactionType":"NOTE","summary":"Follow-up on billing question","correlationId":"lab-request-001"}'

  # Get Amina's interaction timeline
  curl -i "http://localhost:8080/api/v1/customers/CUS-1001/interactions"

  # Get a customer profile
  curl -i "http://localhost:8080/api/v1/customers/CUS-1001"

  # Search customers by partial name
  curl -i "http://localhost:8080/api/v1/customers?query=amina"

  # Trigger not-found path (demo negative case)
  curl -i "http://localhost:8080/api/v1/customers/CUS-9999"

  # Change customer status (legal transition)
  curl -i -X PATCH "http://localhost:8080/api/v1/customers/CUS-1002/status" \
    -H "Content-Type: application/json" \
    -d '{"newStatus":"ACTIVE"}'

  # Trigger illegal transition (demo negative case)
  curl -i -X PATCH "http://localhost:8080/api/v1/customers/CUS-1001/status" \
    -H "Content-Type: application/json" \
    -d '{"newStatus":"PROSPECT"}'
```
- SQL snippet:
```sql
SELECT ci.id, ci.customer_id, ci.correlation_id, ci.created_at
  FROM customer_interaction ci
  LEFT JOIN audit_events ae ON ae.interaction_id = ci.id
  WHERE ae.event_id IS NULL;

  -- Confirm an interaction's audit row directly:
  SELECT * FROM audit_events WHERE interaction_id = '<interaction-id>';
```
- Topic name: crm.customer.interactions.v1
    - Dead-letter topic: crm.customer.interactions.v1.DLT
    - Partition key: customerId
    - Consumer group: audit-consumer
