package com.northstar.crm.repo;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

@DataJpaTest
@Sql("/seed-customers.sql")
@ActiveProfiles("test")
class CustomerRepositoryTest {

    @Autowired
    private CustomerRepository customerRepository;
    private InteractionRepository interactionRepository;

    @Test
    void findById_returnsSeededAmina() {
        var result = customerRepository.findById("CUS-1001");

        assertThat(result).isPresent();
        assertThat(result.get().getFullName()).isEqualTo("Amina Khan");
    }

    @Test
    void findByFullNameContainingIgnoreCase_matchesPartialLowercase() {
        var results = customerRepository.findByFullNameContainingIgnoreCase("amina");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCustomerId()).isEqualTo("CUS-1001");
    }

    @Test
    void findMaxCustomerIdNumber_returnsHighestSeededNumber() {
        Integer max = customerRepository.findMaxCustomerIdNumber();

        assertThat(max).isEqualTo(1002);
    }
}