package org.example.backend.controllers;

import org.example.backend.domain.Concert;
import org.example.backend.domain.Ticket;
import org.example.backend.domain.enums.TicketType;
import org.example.backend.dto.OrderLineItemDto;
import org.example.backend.dto.TicketDto;
import org.example.backend.services.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.backend.domain.OrderLineItem;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/create")
    public ResponseEntity<OrderLineItemDto> createOrderLineItem(
            @RequestParam Long concertId,
            @RequestParam TicketType ticketType,
            @RequestParam int quantity,
            @RequestParam String username) {  // Use username to identify the user

        try {
            System.out.println("concertId: " + concertId);
            System.out.println("ticketType: " + ticketType);
            System.out.println("quantity: " + quantity);
            System.out.println("username: " + username);

            OrderLineItem orderLineItem = ticketService.createAndSaveOrderLineItem(concertId, ticketType, quantity, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(OrderLineItemDto.from(orderLineItem));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{ticketId}/{newType}/updatePriceByType")
    public ResponseEntity<TicketDto> updateTicketPriceByType(
            @PathVariable Long ticketId,
            @PathVariable TicketType newType) {
        try {
            Ticket updatedTicket = ticketService.updateTicketPriceByType(ticketId, newType);
            return ResponseEntity.ok(TicketDto.from(updatedTicket));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getTicketTypes() {
        List<String> ticketTypes = Arrays.stream(TicketType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ticketTypes);
    }



}
