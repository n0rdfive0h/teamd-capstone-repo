CREATE TABLE audit_events (
                              event_id         UUID PRIMARY KEY,
                              interaction_id   UUID NOT NULL,
                              customer_id      VARCHAR(50) NOT NULL,
                              actor            VARCHAR(100) NOT NULL,
                              correlation_id   VARCHAR(100),
                              event_type       VARCHAR(100) NOT NULL,
                              event_version    VARCHAR(10) NOT NULL,
                              processed_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_customer ON audit_events (customer_id);