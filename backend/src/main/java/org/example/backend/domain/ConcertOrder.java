package org.example.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.example.backend.domain.base.BaseEntity;
import org.example.backend.domain.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "concert_orders")
public class ConcertOrder extends BaseEntity<Long> {
    @OneToMany(cascade = CascadeType.ALL)
    private Set<OrderLineItem> orderLineItems = new HashSet<>();

    @ManyToOne // Many orders belong to one user
    @JoinColumn(name = "user_id") // Specify the foreign key column
    private User user; // Reference to the user who placed the order

    //add a status field to the ConcertOrder class
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    public void addLineItem(OrderLineItem lineItem) {
        this.orderLineItems.add(lineItem);
    }
}
