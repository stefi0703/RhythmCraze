package org.example.backend.controllers;

import org.example.backend.domain.Concert;
import org.example.backend.domain.Venue;
import org.example.backend.dto.ConcertDto;
import org.example.backend.services.ConcertService;
import org.example.backend.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
@RequestMapping("/concerts")
public class ConcertController {
    private final ConcertService concertService;
    @Autowired
    public ConcertController(ConcertService concertService) {
        this.concertService = concertService;
    }

    @GetMapping
    public ResponseEntity<List<ConcertDto>> getAllConcertsWithArtistsAndVenues() {
        List<ConcertDto> concerts = concertService.findAllWithArtistAndVenues();
        return new ResponseEntity<>(concerts, HttpStatus.OK);
    }

    // Add filter functionality

    @GetMapping("/filter")
    public ResponseEntity<List<ConcertDto>> filterConcerts(
            @RequestParam(required = false) String artist,
            @RequestParam(required = false) List<Date> dates,
            @RequestParam(required = false) List<String> venueNames) {

        System.out.println("Received filter request:");
        System.out.println("Artist: " + artist);
        System.out.println("Dates: " + dates);
        System.out.println("VenueNames: " + venueNames);

        List<ConcertDto> filteredConcerts = concertService.filterConcerts(artist, dates, venueNames);
        return ResponseEntity.ok(filteredConcerts);
    }


    // Add functionality to add a new concert
    @PostMapping("/")
    public ResponseEntity<?> addConcert(@RequestBody Concert concert) {
        Concert savedConcert = concertService.save(concert);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", "/api/v1/concerts/" + savedConcert.getId());
        return new ResponseEntity<>(headers, HttpStatus.CREATED);
    }

    // Add functionality to delete a concert
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteConcert(@PathVariable Long id) {
        concertService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Add functionality to update a concert
    @PutMapping("/{id}")
    public ResponseEntity<?> updateConcert(@PathVariable Long id, @RequestBody Concert concert) {
        Concert updatedConcert = concertService.update(id, concert);
        return new ResponseEntity<>(updatedConcert, HttpStatus.OK);
    }

    //get concert by id
    @GetMapping("/{id}")
    public ResponseEntity<ConcertDto> getConcertById(@PathVariable Long id) {
        ConcertDto concert = concertService.findById(id);
        return new ResponseEntity<>(concert, HttpStatus.OK);
    }
}
