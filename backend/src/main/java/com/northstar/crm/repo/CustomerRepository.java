package com.northstar.crm.repo;

import com.northstar.crm.domain.Customer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    List<Customer> findByFullNameContainingIgnoreCase(String namePart);

    @Query("SELECT MAX(CAST(SUBSTRING(c.customerId, 5) AS int)) FROM Customer c")
    Integer findMaxCustomerIdNumber();
}