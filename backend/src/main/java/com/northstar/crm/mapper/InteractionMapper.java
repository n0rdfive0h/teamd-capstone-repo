package com.northstar.crm.mapper;

import com.northstar.crm.api.dto.CreateInteractionRequest;
import com.northstar.crm.api.dto.InteractionResponse;
import com.northstar.crm.domain.Interaction;
import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
public class InteractionMapper {

    public Interaction toEntity(CreateInteractionRequest request, String correlationId, String actor) {
        Interaction interaction = new Interaction();
        interaction.setCustomerId(request.customerId());
        interaction.setInteractionType(request.interactionType());
        interaction.setSummary(request.summary());
        interaction.setCorrelationId(correlationId);
        interaction.setActor(actor);
        interaction.setCreatedAt(Instant.now());
        return interaction;
    }

    public InteractionResponse toResponse(Interaction interaction) {
        return new InteractionResponse(
                interaction.getId(),
                interaction.getCustomerId(),
                interaction.getInteractionType(),
                interaction.getSummary(),
                interaction.getCorrelationId(),
                interaction.getCreatedAt());
    }
}