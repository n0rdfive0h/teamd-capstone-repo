package com.northstar.crm.messaging;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class InteractionEventListener {

    private final InteractionEventPublisher eventPublisher;

    public InteractionEventListener(InteractionEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onInteractionRecorded(InteractionRecordedApplicationEvent event) {
        eventPublisher.publish(event.payload());
    }
}