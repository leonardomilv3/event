package com.eventing.shared.util;

public final class PaginationUtil {

    public static final int DEFAULT_PAGE = 0;
    public static final int DEFAULT_SIZE = 20;
    public static final int MAX_SIZE = 100;

    private PaginationUtil() {}

    public static int normalizePage(int page) {
        return Math.max(page, 0);
    }

    public static int normalizeSize(int size) {
        return Math.min(Math.max(size, 1), MAX_SIZE);
    }

    public static long offset(int page, int size) {
        return (long) normalizePage(page) * normalizeSize(size);
    }
}
