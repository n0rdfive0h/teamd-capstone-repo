package com.northstar.crm.api;

import com.northstar.crm.api.dto.CreateInteractionRequest;
import com.northstar.crm.api.dto.InteractionResponse;
import com.northstar.crm.service.InteractionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InteractionController {

  private final InteractionService interactionService;

  public InteractionController(InteractionService interactionService) {
    this.interactionService = interactionService;
  }

  @PostMapping("/api/v1/interactions")
  public ResponseEntity<InteractionResponse> create(
          @Valid @RequestBody CreateInteractionRequest request,
          @RequestHeader(value = "X-Correlation-ID", required = false) String correlationHeader) {
    InteractionResponse body = interactionService.create(request, correlationHeader);
    return ResponseEntity.status(HttpStatus.CREATED).body(body);
  }

  @GetMapping("/api/v1/customers/{customerId}/interactions")
  public ResponseEntity<List<InteractionResponse>> getTimeline(@PathVariable String customerId) {
    return ResponseEntity.ok(interactionService.getTimeline(customerId));
  }
}