package com.eventing.seo;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/sitemap.xml")
@Tag(name = "SEO", description = "Indexação orgânica")
public class SitemapController {

    @Inject SitemapService sitemapService;

    @GET
    @Produces(MediaType.APPLICATION_XML)
    @Operation(summary = "Sitemap com eventos PUBLISHED + PUBLIC ativos (cache Redis 1h)")
    public Response sitemap() {
        return Response.ok(sitemapService.getSitemapXml())
                .header("Cache-Control", "public, max-age=3600")
                .build();
    }
}
