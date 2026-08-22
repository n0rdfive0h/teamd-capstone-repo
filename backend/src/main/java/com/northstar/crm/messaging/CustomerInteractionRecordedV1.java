package com.northstar.crm.messaging;

import java.time.Instant;
import java.util.UUID;


public record CustomerInteractionRecordedV1(
        UUID eventId,
        String eventType,
        String eventVersion,
        Instant occurredAt,
        String correlationId,
        String actor,
        String customerId,
        UUID interactionId,
        String interactionType
) {
  public static final String TYPE = "CustomerInteractionRecorded";
  public static final String VERSION = "1";
}