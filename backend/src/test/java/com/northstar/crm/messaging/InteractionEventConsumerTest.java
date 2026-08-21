package com.northstar.crm.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.northstar.crm.repo.AuditEventRepository;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class InteractionEventConsumerTest {

    @Autowired
    private AuditEventRepository auditEventRepository;

    private InteractionEventConsumer consumer;

    private CustomerInteractionRecordedV1 sampleEvent(UUID eventId) {
        return new CustomerInteractionRecordedV1(
                eventId,
                CustomerInteractionRecordedV1.TYPE,
                CustomerInteractionRecordedV1.VERSION,
                Instant.now(),
                "lab-request-001",
                "agent1",
                "CUS-1001",
                UUID.randomUUID(),
                "NOTE");
    }

    @Test
    void duplicateEvent_isNoOp() {
        consumer = new InteractionEventConsumer(auditEventRepository);
        UUID eventId = UUID.randomUUID();
        CustomerInteractionRecordedV1 event = sampleEvent(eventId);

        consumer.onInteractionRecorded(event);
        assertThat(auditEventRepository.existsById(eventId)).isTrue();

        // Second delivery of the exact same event — must not throw, must not duplicate
        assertThatCode(() -> consumer.onInteractionRecorded(event)).doesNotThrowAnyException();
        assertThat(auditEventRepository.count()).isEqualTo(1);
    }

    @Test
    void incompatibleVersion_isRejected() {
        consumer = new InteractionEventConsumer(auditEventRepository);
        CustomerInteractionRecordedV1 badVersionEvent =
                new CustomerInteractionRecordedV1(
                        UUID.randomUUID(),
                        CustomerInteractionRecordedV1.TYPE,
                        "99", // unsupported version
                        Instant.now(),
                        "lab-request-001",
                        "agent1",
                        "CUS-1001",
                        UUID.randomUUID(),
                        "NOTE");

        assertThatThrownBy(() -> consumer.onInteractionRecorded(badVersionEvent))
                .isInstanceOf(IllegalArgumentException.class);
    }
}