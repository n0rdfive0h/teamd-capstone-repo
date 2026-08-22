CREATE TABLE customer (
                          customer_id VARCHAR(50) PRIMARY KEY,
                          full_name   VARCHAR(200) NOT NULL,
                          status      VARCHAR(20) NOT NULL,
                          email       VARCHAR(200) NOT NULL
);

CREATE INDEX idx_customer_full_name ON customer (full_name);

INSERT INTO customer (customer_id, full_name, status, email) VALUES
                                                                 ('CUS-1001', 'Amina Khan', 'ACTIVE', 'amina.khan@example.test'),
                                                                 ('CUS-1002', 'Ravi Singh', 'PROSPECT', 'ravi.singh@example.test');