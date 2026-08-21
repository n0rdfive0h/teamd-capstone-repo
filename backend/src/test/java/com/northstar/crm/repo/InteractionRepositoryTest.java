package com.northstar.crm.repo;

import static org.assertj.core.api.Assertions.assertThat;
import org.springframework.beans.factory.annotation.Autowired;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@ActiveProfiles("test")
class InteractionRepositoryTest {

    @Autowired
    private InteractionRepository interactionRepository;

    @Test
    @Sql("/seed-interactions.sql")
    void findByCustomerId_returnsAminaInteractionsOrderedByCreatedAtDesc() {
        var results = interactionRepository.findByCustomerIdOrderByCreatedAtDesc("CUS-1001");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCustomerId()).isEqualTo("CUS-1001");
    }
}