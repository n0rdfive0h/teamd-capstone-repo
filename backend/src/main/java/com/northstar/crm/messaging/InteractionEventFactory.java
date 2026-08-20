package com.northstar.crm.messaging;

import com.northstar.crm.domain.Interaction;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class InteractionEventFactory {

    public CustomerInteractionRecordedV1 interactionRecorded(Interaction interaction, String correlationId) {
        return new CustomerInteractionRecordedV1(
                UUID.randomUUID(),
                CustomerInteractionRecordedV1.TYPE,
                CustomerInteractionRecordedV1.VERSION,
                Instant.now(),
                correlationId,
                interaction.getActor(),
                interaction.getCustomerId(),
                interaction.getId(),
                interaction.getInteractionType());
    }
}