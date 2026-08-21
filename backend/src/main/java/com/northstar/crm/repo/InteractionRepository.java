package com.northstar.crm.repo;

import com.northstar.crm.domain.Interaction;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, UUID> {

  List<Interaction> findByCustomerIdOrderByCreatedAtDesc(String customerId);
}