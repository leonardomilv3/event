package com.eventing.seo;

import com.eventing.events.EventRepository;
import com.eventing.events.SitemapEventRow;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.SetArgs;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@ApplicationScoped
public class SitemapService {

    static final String CACHE_KEY = "seo:sitemap";
    private static final int CACHE_TTL_SECONDS = 3600;
    // Limite do protocolo sitemaps.org por arquivo
    private static final int MAX_URLS = 50_000;

    @Inject EventRepository eventRepository;
    @Inject RedisDataSource redis;

    @ConfigProperty(name = "eventing.app.url", defaultValue = "https://event-ten-delta.vercel.app")
    String appUrl;

    public String getSitemapXml() {
        String cached = fromCache();
        if (cached != null) return cached;

        List<SitemapEventRow> rows = eventRepository.findSitemapEntries(
                LocalDateTime.now(ZoneOffset.UTC), MAX_URLS);
        String xml = buildXml(rows);
        toCache(xml);
        return xml;
    }

    String buildXml(List<SitemapEventRow> rows) {
        String base = appUrl.endsWith("/") ? appUrl.substring(0, appUrl.length() - 1) : appUrl;
        StringBuilder sb = new StringBuilder()
                .append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
                .append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (SitemapEventRow row : rows) {
            sb.append("  <url>\n")
              .append("    <loc>").append(escapeXml(base + "/events/" + row.id())).append("</loc>\n");
            if (row.updatedAt() != null) {
                sb.append("    <lastmod>")
                  .append(row.updatedAt().atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME))
                  .append("</lastmod>\n");
            }
            sb.append("  </url>\n");
        }
        return sb.append("</urlset>\n").toString();
    }

    private static String escapeXml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private String fromCache() {
        try {
            return redis.value(String.class).get(CACHE_KEY);
        } catch (Exception ignored) {
            // Redis indisponível: gera direto do DB
            return null;
        }
    }

    private void toCache(String xml) {
        try {
            redis.value(String.class).set(CACHE_KEY, xml, new SetArgs().ex(CACHE_TTL_SECONDS));
        } catch (Exception ignored) {
            // Redis indisponível: continua sem cache
        }
    }
}
