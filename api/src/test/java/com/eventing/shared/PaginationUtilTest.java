package com.eventing.shared;

import com.eventing.shared.util.PaginationUtil;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PaginationUtilTest {

    @Test
    void normalizePageShouldReturnZeroForNegative() {
        assertEquals(0, PaginationUtil.normalizePage(-1));
        assertEquals(0, PaginationUtil.normalizePage(-100));
    }

    @Test
    void normalizePageShouldReturnValueForPositive() {
        assertEquals(0, PaginationUtil.normalizePage(0));
        assertEquals(5, PaginationUtil.normalizePage(5));
    }

    @Test
    void normalizeSizeShouldClampToMaxSize() {
        assertEquals(PaginationUtil.MAX_SIZE, PaginationUtil.normalizeSize(999));
        assertEquals(PaginationUtil.MAX_SIZE, PaginationUtil.normalizeSize(101));
    }

    @Test
    void normalizeSizeShouldClampToMinimumOne() {
        assertEquals(1, PaginationUtil.normalizeSize(0));
        assertEquals(1, PaginationUtil.normalizeSize(-5));
    }

    @Test
    void normalizeSizeShouldReturnValueWithinRange() {
        assertEquals(20, PaginationUtil.normalizeSize(20));
        assertEquals(50, PaginationUtil.normalizeSize(50));
    }

    @Test
    void offsetShouldCalculateCorrectly() {
        assertEquals(0L, PaginationUtil.offset(0, 20));
        assertEquals(20L, PaginationUtil.offset(1, 20));
        assertEquals(40L, PaginationUtil.offset(2, 20));
    }

    @Test
    void offsetShouldNormalizeBothArguments() {
        // page=-1 → 0, size=-1 → 1, offset=0*1=0
        assertEquals(0L, PaginationUtil.offset(-1, -1));
        // page=0, size=150 → 100 (max), offset=0*100=0
        assertEquals(0L, PaginationUtil.offset(0, 150));
        // page=1, size=150 → 100 (max), offset=1*100=100
        assertEquals(100L, PaginationUtil.offset(1, 150));
    }
}
