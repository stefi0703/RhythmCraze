package org.example.backend.services;

import org.example.backend.domain.ConcertOrder;
import org.example.backend.domain.OrderLineItem;
import org.example.backend.domain.enums.OrderStatus;
import org.example.backend.dto.OrderDto;

import java.util.List;

public interface ConcertOrderService {
    void save(ConcertOrder concertOrder);

    ConcertOrder findOrCreateOrder(Long userId);

    void addOrderLineItemToOrder(OrderLineItem orderLineItem, Long orderId);

    OrderDto getOrderDtoById(Long orderId);

    List<OrderDto> getOrdersByUsername(String username);

    void deleteOrderLineItem(Long id, Long orderId);

    void updateOrderStatus(Long orderId, OrderStatus newStatus);
}

