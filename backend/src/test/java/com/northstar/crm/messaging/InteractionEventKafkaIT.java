package com.northstar.crm.messaging;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.kafka.KafkaContainer;
import org.testcontainers.utility.DockerImageName;
import com.northstar.crm.repo.AuditEventRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.awaitility.Awaitility;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
class InteractionEventKafkaIT {

    @Container
    @ServiceConnection
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("apache/kafka:3.8.0"));

    @Autowired
    private InteractionEventPublisher eventPublisher;

    @Autowired
    private AuditEventRepository auditEventRepository;

    @Test
    void publishedEvent_isConsumedAndAudited() throws Exception {
        UUID eventId = UUID.randomUUID();
        UUID interactionId = UUID.randomUUID();

        CustomerInteractionRecordedV1 event = new CustomerInteractionRecordedV1(
                eventId,
                CustomerInteractionRecordedV1.TYPE,
                CustomerInteractionRecordedV1.VERSION,
                Instant.now(),
                "lab-request-001",
                "agent1",
                "CUS-1001",
                interactionId,
                "NOTE");

        eventPublisher.publish(event);

        Awaitility.await()
                .atMost(Duration.ofSeconds(10))
                .untilAsserted(() -> assertThat(auditEventRepository.existsById(eventId)).isTrue());
    }
}