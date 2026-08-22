package com.northstar.crm.service;

import com.northstar.crm.api.dto.CreateInteractionRequest;
import com.northstar.crm.api.dto.InteractionResponse;
import com.northstar.crm.domain.Interaction;
import com.northstar.crm.domain.exception.CustomerNotFoundException;
import com.northstar.crm.mapper.InteractionMapper;
import com.northstar.crm.messaging.InteractionEventFactory;
import com.northstar.crm.messaging.InteractionRecordedApplicationEvent;
import com.northstar.crm.repo.InteractionRepository;
import com.northstar.crm.repo.CustomerRepository;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InteractionService {

  private static final String PLACEHOLDER_ACTOR = "agent1";
  private static final String DEFAULT_CORRELATION_ID = "lab-request-001";

  private final InteractionRepository interactionRepository;
  private final InteractionMapper mapper;
  private final InteractionEventFactory eventFactory;
  private final ApplicationEventPublisher applicationEventPublisher;
  private final CustomerRepository customerRepository;

  public InteractionService(
          InteractionRepository interactionRepository,
          InteractionMapper mapper,
          InteractionEventFactory eventFactory,
          ApplicationEventPublisher applicationEventPublisher,
          CustomerRepository customerRepository) {
    this.interactionRepository = interactionRepository;
    this.mapper = mapper;
    this.eventFactory = eventFactory;
    this.applicationEventPublisher = applicationEventPublisher;
    this.customerRepository = customerRepository;
  }

  @Transactional
  public InteractionResponse create(CreateInteractionRequest request, String correlationHeader) {
    String correlationId = resolveCorrelationId(correlationHeader, request);
    requireCustomerExists(request.customerId());

    Interaction toSave = mapper.toEntity(request, correlationId, PLACEHOLDER_ACTOR);
    Interaction saved = interactionRepository.save(toSave);

    var event = eventFactory.interactionRecorded(saved, correlationId);
    applicationEventPublisher.publishEvent(new InteractionRecordedApplicationEvent(event));

    return mapper.toResponse(saved);
  }

  private String resolveCorrelationId(String correlationHeader, CreateInteractionRequest request) {
    if (correlationHeader != null && !correlationHeader.isBlank()) {
      return correlationHeader;
    }
    if (request.correlationId() != null && !request.correlationId().isBlank()) {
      return request.correlationId();
    }
    return DEFAULT_CORRELATION_ID;
  }

  private void requireCustomerExists(String customerId) {
    if (!customerRepository.existsById(customerId)) {
      throw new CustomerNotFoundException(customerId);
    }
  }

  public List<InteractionResponse> getTimeline(String customerId) {
    requireCustomerExists(customerId);
    return interactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
            .map(mapper::toResponse)
            .toList();
  }
}