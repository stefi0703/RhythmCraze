package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.example.backend.domain.ConcertOrder;
import org.example.backend.dto.base.BaseDto;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Data
public class OrderDto extends BaseDto implements Serializable{
    private Long id;
    private List<OrderLineItemDto> lineItems;
    private LocalDateTime orderDate;


    // Standard getters and setters

    public static OrderDto from(ConcertOrder order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setLineItems(order.getOrderLineItems().stream()
                .map(OrderLineItemDto::from)
                .collect(Collectors.toList()));
        return dto;
    }
}

