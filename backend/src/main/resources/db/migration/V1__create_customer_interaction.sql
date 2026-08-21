CREATE TABLE customer_interaction (
    id               UUID PRIMARY KEY,
    customer_id      VARCHAR(50)   NOT NULL,
    interaction_type VARCHAR(20)   NOT NULL,
    summary          VARCHAR(1000) NOT NULL,
    correlation_id   VARCHAR(100),
    actor            VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now());

CREATE INDEX idx_customer_interaction_customer_created
    ON customer_interaction (customer_id, created_at DESC);