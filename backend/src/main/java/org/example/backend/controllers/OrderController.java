package org.example.backend.controllers;

import jakarta.persistence.EntityNotFoundException;
import org.example.backend.domain.enums.OrderStatus;
import org.example.backend.dto.OrderDto;
import org.example.backend.services.ConcertOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final ConcertOrderService concertOrderService;

    public OrderController(ConcertOrderService concertOrderService) {
        this.concertOrderService = concertOrderService;
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long orderId) {
        try {
            OrderDto order = concertOrderService.getOrderDtoById(orderId);
            return ResponseEntity.ok(order);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<OrderDto>> getOrdersByUsername(@PathVariable String username) {
        List<OrderDto> orders = concertOrderService.getOrdersByUsername(username);
        return ResponseEntity.ok(orders);
    }

    @DeleteMapping("/{orderId}/orderLineItems/{lineItemId}")
    public ResponseEntity<Void> removeOrderLineItem(
            @PathVariable Long orderId,
            @PathVariable Long lineItemId) {
        try {
            concertOrderService.deleteOrderLineItem(orderId, lineItemId);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            OrderStatus newStatus = OrderStatus.valueOf(statusUpdate.get("status"));
            concertOrderService.updateOrderStatus(orderId, newStatus);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }





    // Other methods for managing orders, such as retrieving orders, updating orders, etc.
}
