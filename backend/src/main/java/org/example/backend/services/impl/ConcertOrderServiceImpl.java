package org.example.backend.services.impl;

import jakarta.persistence.EntityNotFoundException;
import org.example.backend.domain.ConcertOrder;
import org.example.backend.domain.OrderLineItem;
import org.example.backend.domain.Ticket;
import org.example.backend.domain.User;
import org.example.backend.domain.enums.OrderStatus;
import org.example.backend.dto.OrderDto;
import org.example.backend.repositories.ConcertOrderRepository;
import org.example.backend.repositories.OrderLineItemRepository;
import org.example.backend.repositories.TicketRepository;
import org.example.backend.repositories.UserRepository;
import org.example.backend.services.ConcertOrderService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConcertOrderServiceImpl implements ConcertOrderService {
    private final ConcertOrderRepository concertOrderRepository;
    private final OrderLineItemRepository orderLineItemRepository;
    private final UserRepository userRepository;

    public ConcertOrderServiceImpl(ConcertOrderRepository concertOrderRepository, OrderLineItemRepository orderLineItemRepository, UserRepository userRepository) {
        this.concertOrderRepository = concertOrderRepository;
        this.orderLineItemRepository = orderLineItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void save(ConcertOrder concertOrder) {
        concertOrderRepository.save(concertOrder);
    }

    @Override
    public ConcertOrder findOrCreateOrder(Long userId) {
        // Ensure that userId is not null
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }

        return concertOrderRepository.findByUserIdAndStatus(userId, OrderStatus.ACTIVE)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow(
                            () -> new UsernameNotFoundException("User not found with ID: " + userId)
                    );
                    ConcertOrder newOrder = new ConcertOrder();
                    newOrder.setUser(user); // Set the user retrieved from the database
                    newOrder.setStatus(OrderStatus.ACTIVE);
                    return concertOrderRepository.save(newOrder); // Ensure the new order is saved
                });
    }


    @Override
    public void addOrderLineItemToOrder(OrderLineItem lineItem, Long orderId) {
        ConcertOrder order = concertOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("Order not found"));
        order.addLineItem(lineItem);
        concertOrderRepository.save(order);
    }

    @Override
    public OrderDto getOrderDtoById(Long orderId) {
        ConcertOrder order = concertOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("Order not found"));
        return OrderDto.from(order);
    }

    @Override
    public List<OrderDto> getOrdersByUsername(String username) {
        User user = userRepository.findByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        // Only fetch orders that are ACTIVE or in CHECKOUT status
        List<ConcertOrder> orders = concertOrderRepository.findByUserAndStatusIn(
                user,
                List.of(OrderStatus.ACTIVE, OrderStatus.CHECKOUT)
        );

        return orders.stream().map(OrderDto::from).collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getPlacedOrdersByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        // For order history - only PLACED orders
        List<ConcertOrder> orders = concertOrderRepository.findByUserAndStatus(user, OrderStatus.PLACED);
        return orders.stream().map(OrderDto::from).collect(Collectors.toList());
    }

    public void deleteOrderLineItem(Long orderId, Long lineItemId) {
        // Retrieve the order
        ConcertOrder order = concertOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("Order not found"));

        // Find and remove the order line item
        boolean removed = order.getOrderLineItems().removeIf(item -> item.getId().equals(lineItemId));

        if (!removed) {
            throw new IllegalStateException("Order line item not found in the order");
        }

        // Check if this was the last item in the order
        if (order.getOrderLineItems().isEmpty()) {
            // If order is empty, delete the entire order
            concertOrderRepository.deleteById(orderId);
        } else {
            // Otherwise, save the updated order
            concertOrderRepository.save(order);
        }

        // Delete the line item from the repository
        orderLineItemRepository.deleteById(lineItemId);
    }

    @Override
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        ConcertOrder order = concertOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalStateException("Order not found"));

        order.setStatus(status);

        // Set order date when status changes to PLACED
        if (status == OrderStatus.PLACED) {
            order.setOrderDate(LocalDateTime.now());
        }

        concertOrderRepository.save(order);
    }

}
