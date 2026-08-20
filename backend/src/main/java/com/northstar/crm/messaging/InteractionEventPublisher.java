package com.northstar.crm.messaging;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class InteractionEventPublisher {

  private static final String TOPIC = "crm.customer.interactions.v1";

  private final KafkaTemplate<String, CustomerInteractionRecordedV1> kafkaTemplate;

  public InteractionEventPublisher(KafkaTemplate<String, CustomerInteractionRecordedV1> kafkaTemplate) {
    this.kafkaTemplate = kafkaTemplate;
  }

  public void publish(CustomerInteractionRecordedV1 event) {
    kafkaTemplate.send(TOPIC, event.customerId(), event);
  }
}