// ExternalConcertService.js
class ExternalConcertService {
  static transformTicketmasterEvent(tmEvent) {
    // Transform Ticketmaster event to match our backend concert structure
    const concert = {
      id: `TM-${tmEvent.id}`, // Prefix to distinguish from backend IDs
      name: tmEvent.name,
      date: tmEvent.dates.start.localDate,
      venue: tmEvent._embedded?.venues?.[0]?.name || "Unknown Venue",
      tickets: [],
    };

    // Create ticket types based on price ranges
    if (tmEvent.priceRanges) {
      const priceRange = tmEvent.priceRanges[0];

      // Create three ticket types with different prices
      concert.tickets = [
        {
          id: `TM-${tmEvent.id}-GENERAL`,
          type: "GENERAL",
          price: priceRange.min,
          available: true,
        },
        {
          id: `TM-${tmEvent.id}-VIP`,
          type: "VIP",
          price: (priceRange.min + priceRange.max) / 2,
          available: true,
        },
        {
          id: `TM-${tmEvent.id}-PREMIUM`,
          type: "PREMIUM",
          price: priceRange.max,
          available: true,
        },
      ];
    } else {
      // Default prices if no price range is available
      concert.tickets = [
        {
          id: `TM-${tmEvent.id}-GENERAL`,
          type: "GENERAL",
          price: 50,
          available: true,
        },
      ];
    }

    return concert;
  }
}

export default ExternalConcertService;
