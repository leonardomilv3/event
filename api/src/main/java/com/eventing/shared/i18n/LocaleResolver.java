package com.eventing.shared.i18n;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.HttpHeaders;

import java.util.List;
import java.util.Locale;

/**
 * Resolves the request locale from {@code Accept-Language}, restricting to supported locales.
 * Fallback: {@link #DEFAULT} (EN) when the header is missing, empty or unsupported.
 *
 * <p>Request-scoped: safe to inject anywhere within the request lifecycle, including
 * {@code ExceptionMapper}s (they run inside the request context).
 */
@RequestScoped
public class LocaleResolver {

    public static final Locale DEFAULT = Locale.ENGLISH;
    public static final List<Locale> SUPPORTED = List.of(Locale.ENGLISH, Locale.forLanguageTag("pt-BR"));

    @Inject
    HttpHeaders headers;

    public Locale resolve() {
        if (headers == null) {
            System.err.println("[i18n] headers == null → DEFAULT=" + DEFAULT);
            return DEFAULT;
        }
        List<Locale> acceptable = headers.getAcceptableLanguages();
        System.err.println("[i18n] acceptable=" + acceptable
                + " defaultJvm=" + Locale.getDefault()
                + " rawHeader=" + headers.getHeaderString("Accept-Language"));
        if (acceptable == null || acceptable.isEmpty()) {
            System.err.println("[i18n] INSIDE ACC IF: " + DEFAULT);
            return DEFAULT;
        }
        System.err.println("[i18n] AFTER ACC IF: " + DEFAULT);
        for (Locale requested : acceptable) {
            Locale match = matchSupported(requested);
            System.err.println("[i18n] MATCH: " + match + " AND REQUESTED: " + requested);
            if (match != null) return match;
        }
        System.err.println("[i18n] FINAL LINE: " + DEFAULT);
        return DEFAULT;
    }

    /** En → EN; qualquer pt → pt-BR. */
    private Locale matchSupported(Locale requested) {
        String lang = requested.getLanguage();
        if (lang == null) return null;
        return switch (lang.toLowerCase()) {
            case "pt" -> Locale.forLanguageTag("pt-BR");
            case "en" -> Locale.ENGLISH;
            default -> null;
        };
    }
}