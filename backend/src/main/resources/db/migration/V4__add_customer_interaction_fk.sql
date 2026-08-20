ALTER TABLE customer_interaction
    ADD CONSTRAINT fk_interaction_customer
        FOREIGN KEY (customer_id) REFERENCES customer (customer_id);