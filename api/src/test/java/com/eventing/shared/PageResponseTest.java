package com.eventing.shared;

import com.eventing.shared.response.PageResponse;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PageResponseTest {

    @Test
    void shouldCalculateTotalPagesCorrectly() {
        List<String> items = List.of("a", "b", "c", "d", "e");
        PageResponse<String> response = PageResponse.of(items, 0, 5, 12);

        assertEquals(3, response.totalPages());
        assertEquals(12, response.totalElements());
        assertEquals(5, response.content().size());
        assertEquals(0, response.page());
        assertEquals(5, response.size());
    }

    @Test
    void shouldReturn1TotalPageWhenExactFit() {
        List<String> items = List.of("a", "b", "c", "d", "e");
        PageResponse<String> response = PageResponse.of(items, 0, 5, 5);

        assertEquals(1, response.totalPages());
        assertEquals(5, response.totalElements());
    }

    @Test
    void shouldReturn0TotalPagesAndEmptyContentWhenNoElements() {
        PageResponse<String> response = PageResponse.of(Collections.emptyList(), 0, 5, 0);

        assertEquals(0, response.totalPages());
        assertEquals(0, response.totalElements());
        assertTrue(response.content().isEmpty());
    }

    @Test
    void shouldReturn0TotalPagesWhenSizeIsZeroAvoidsDivisionByZero() {
        PageResponse<String> response = PageResponse.of(Collections.emptyList(), 0, 0, 0);

        assertEquals(0, response.totalPages());
    }

    @Test
    void totalElementsShouldReflectTotalNotContentSize() {
        List<String> items = List.of("a", "b");
        PageResponse<String> response = PageResponse.of(items, 2, 2, 10);

        assertEquals(2, response.content().size());
        assertEquals(10, response.totalElements());
        assertEquals(5, response.totalPages());
        assertEquals(2, response.page());
    }

    @Test
    void shouldRoundUpForPartialLastPage() {
        List<String> items = List.of("a");
        PageResponse<String> response = PageResponse.of(items, 1, 3, 7);

        // 7 / 3 = 2.33 → 3 páginas
        assertEquals(3, response.totalPages());
    }
}
