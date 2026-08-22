package com.northstar.crm.messaging;

import com.northstar.crm.domain.AuditEvent;
import com.northstar.crm.repo.AuditEventRepository;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class InteractionEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(InteractionEventConsumer.class);
    private static final String SUPPORTED_VERSION = CustomerInteractionRecordedV1.VERSION;

    private final AuditEventRepository auditEventRepository;

    public InteractionEventConsumer(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @KafkaListener(
            topics = "crm.customer.interactions.v1",
            groupId = "audit-consumer",
            containerFactory = "kafkaListenerContainerFactory")
    public void onInteractionRecorded(CustomerInteractionRecordedV1 event) {
        if (!SUPPORTED_VERSION.equals(event.eventVersion())) {
            log.warn(
                    "Rejecting incompatible event version. eventId={} correlationId={} version={}",
                    event.eventId(), event.correlationId(), event.eventVersion());
            throw new IllegalArgumentException("Unsupported event version: " + event.eventVersion());
        }

        if (auditEventRepository.existsById(event.eventId())) {
            log.info(
                    "Duplicate event ignored. eventId={} correlationId={}",
                    event.eventId(), event.correlationId());
            return;
        }

        AuditEvent auditEvent = new AuditEvent();
        auditEvent.setEventId(event.eventId());
        auditEvent.setInteractionId(event.interactionId());
        auditEvent.setCustomerId(event.customerId());
        auditEvent.setActor(event.actor());
        auditEvent.setCorrelationId(event.correlationId());
        auditEvent.setEventType(event.eventType());
        auditEvent.setEventVersion(event.eventVersion());
        auditEvent.setProcessedAt(Instant.now());

        auditEventRepository.save(auditEvent);

        log.info(
                "Processed interaction event. eventId={} correlationId={} customerId={}",
                event.eventId(), event.correlationId(), event.customerId());
    }
}