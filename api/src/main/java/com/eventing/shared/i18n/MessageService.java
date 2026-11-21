package com.eventing.shared.i18n;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.util.Locale;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Resolves i18n messages from {@code i18n/messages*.properties}.
 *
 * <p>Reads {@code messages.properties} as the EN base bundle and
 * {@code messages_pt_BR.properties} as the PT bundle. Explicitly uses UTF-8
 * (the JDK's {@code PropertyResourceBundle} default is ISO-8859-1, which
 * mangles accented characters like {@code ã}).
 *
 * <p>Avoids {@link java.util.ResourceBundle} on purpose: its default fallback
 * chain consults {@code Locale.getDefault()} when the base bundle is missing,
 * which silently returns PT-BR messages for EN requests. Here, a missing base
 * bundle is logged loudly at startup and per-request — no silent wrong-language
 * responses.
 */
@ApplicationScoped
public class MessageService {

    private static final Logger LOG = Logger.getLogger(MessageService.class);

    private static final String BASE_PATH = "i18n/messages";

    /** key = normalized locale tag ("en", "pt_BR"); value = loaded properties or null. */
    private final ConcurrentHashMap<String, Properties> cache = new ConcurrentHashMap<>();

    @PostConstruct
    void warmUp() {
        Properties en = load("en");
        if (en == null) {
            LOG.errorf("[i18n] FATAL: base bundle %s.properties not found on classpath — "
                    + "EN requests will fall back to i18n keys. "
                    + "Fix: create api/src/main/resources/i18n/messages.properties",
                    BASE_PATH);
        } else {
            LOG.infof("[i18n] loaded %s.properties (en) with %d keys",
                    BASE_PATH, en.size());
        }
        Properties pt = load("pt_BR");
        if (pt == null) {
            LOG.warnf("[i18n] %s_pt_BR.properties not found on classpath — "
                    + "PT requests will use EN messages", BASE_PATH);
        } else {
            LOG.infof("[i18n] loaded %s_pt_BR.properties (pt_BR) with %d keys",
                    BASE_PATH, pt.size());
        }
    }

    public String get(String key, Locale locale) {
        return get(key, locale, new Object[0]);
    }

    public String get(String key, Locale locale, Object... args) {
        if (key == null || key.isBlank()) return "";

        String tag = normalizeTag(locale);
        String template = lookup(key, tag);

        if (template == null) {
            // Not in requested locale: try EN base, then give up with the key itself.
            if (!"en".equals(tag)) {
                template = lookup(key, "en");
            }
            if (template == null) {
                LOG.warnf("[i18n] key '%s' not found in any bundle (requested=%s)", key, tag);
                return key;
            }
        }

        return (args != null && args.length > 0)
                ? MessageFormat.format(template, args)
                : template;
    }

    // ── Internals ────────────────────────────────────────────────────────

    private String lookup(String key, String tag) {
        Properties props = cache.computeIfAbsent(tag, this::load);
        return props != null ? props.getProperty(key) : null;
    }

    /** "en", "pt-BR" → "en", "pt_BR" (matches resource file suffix convention). */
    private static String normalizeTag(Locale locale) {
        if (locale == null) return "en";
        String lang = locale.getLanguage();
        if (lang == null || lang.isBlank()) return "en";
        if (!"pt".equalsIgnoreCase(lang)) return "en"; // only EN and PT-BR supported
        return "pt_BR";
    }

    /** Loads {@code i18n/messages_<tag>.properties} (or base for "en") as UTF-8. */
    private Properties load(String tag) {
        String path = "en".equals(tag)
                ? BASE_PATH + ".properties"
                : BASE_PATH + "_" + tag + ".properties";

        ClassLoader loader = Thread.currentThread().getContextClassLoader();
        if (loader == null) loader = MessageService.class.getClassLoader();

        try (InputStream in = loader.getResourceAsStream(path)) {
            if (in == null) return null;
            Properties props = new Properties();
            try (Reader reader = new InputStreamReader(in, StandardCharsets.UTF_8)) {
                props.load(reader);
            }
            return props;
        } catch (IOException e) {
            LOG.errorf(e, "[i18n] failed to load %s", path);
            return null;
        }
    }
}