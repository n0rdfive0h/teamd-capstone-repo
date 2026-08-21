package com.northstar.crm.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.northstar.crm.api.dto.CreateInteractionRequest;
import com.northstar.crm.api.dto.InteractionResponse;
import com.northstar.crm.domain.Interaction;
import com.northstar.crm.mapper.InteractionMapper;
import com.northstar.crm.messaging.InteractionEventFactory;
import com.northstar.crm.repo.InteractionRepository;
import com.northstar.crm.repo.CustomerRepository;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

class InteractionServiceTest {

  private InteractionRepository interactionRepository;
  private InteractionMapper mapper;
  private InteractionEventFactory eventFactory;
  private ApplicationEventPublisher applicationEventPublisher;
  private InteractionService service;
  private CustomerRepository customerRepository;

  @BeforeEach
  void setUp() {
    interactionRepository = mock(InteractionRepository.class);
    mapper = mock(InteractionMapper.class);
    eventFactory = mock(InteractionEventFactory.class);
    applicationEventPublisher = mock(ApplicationEventPublisher.class);
    customerRepository = mock(CustomerRepository.class);
    service = new InteractionService(
            interactionRepository, mapper, eventFactory, applicationEventPublisher, customerRepository);
  }

  @Test
  void create_forAmina_returnsCreatedShape() {
    CreateInteractionRequest request =
            new CreateInteractionRequest(
                    "CUS-1001", "NOTE", "Follow-up on billing question", "lab-request-001");

    Interaction toSave = new Interaction();
    Interaction saved = new Interaction();
    saved.setId(UUID.randomUUID());
    saved.setCustomerId("CUS-1001");
    saved.setInteractionType("NOTE");
    saved.setSummary("Follow-up on billing question");
    saved.setCorrelationId("lab-request-001");
    saved.setCreatedAt(Instant.now());

    when(mapper.toEntity(eq(request), eq("lab-request-001"), any())).thenReturn(toSave);
    when(interactionRepository.save(toSave)).thenReturn(saved);
    when(mapper.toResponse(saved))
            .thenReturn(
                    new InteractionResponse(
                            saved.getId(), "CUS-1001", "NOTE", "Follow-up on billing question",
                            "lab-request-001", saved.getCreatedAt()));

    when(customerRepository.existsById("CUS-1001")).thenReturn(true);
    InteractionResponse response = service.create(request, "lab-request-001");

    assertNotNull(response.id());
    assertEquals("CUS-1001", response.customerId());
    assertEquals("lab-request-001", response.correlationId());
  }

  @Test
  void create_unknownCustomer_fails() {
    CreateInteractionRequest request =
            new CreateInteractionRequest("CUS-9999", "NOTE", "Should fail", "lab-request-001");

    assertThrows(RuntimeException.class, () -> service.create(request, null));

    verify(applicationEventPublisher, never()).publishEvent(any());
    verify(interactionRepository, never()).save(any());
  }
}
