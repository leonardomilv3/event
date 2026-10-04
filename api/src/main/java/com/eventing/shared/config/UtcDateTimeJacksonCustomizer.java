package com.eventing.shared.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import io.quarkus.jackson.ObjectMapperCustomizer;
import jakarta.inject.Singleton;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;

/**
 * Todo LocalDateTime do domínio é UTC (ver quarkus.hibernate-orm.jdbc.timezone). Sem offset no
 * JSON, o browser interpreta "2026-09-17T22:00:00" como hora local e desloca o horário pelo fuso
 * do usuário — por isso serializamos sempre com "Z".
 */
@Singleton
public class UtcDateTimeJacksonCustomizer implements ObjectMapperCustomizer {

    // Roda por último: o módulo registrado mais tarde prevalece sobre o JavaTimeModule do Quarkus
    @Override
    public int priority() {
        return MINIMUM_PRIORITY;
    }

    @Override
    public void customize(ObjectMapper mapper) {
        SimpleModule module = new SimpleModule("utc-local-date-time");
        module.addSerializer(LocalDateTime.class, new Serializer());
        module.addDeserializer(LocalDateTime.class, new Deserializer());
        mapper.registerModule(module);
    }

    static final class Serializer extends JsonSerializer<LocalDateTime> {
        @Override
        public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            gen.writeString(value.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        }
    }

    /** Aceita com e sem offset — entradas antigas do cache Redis foram gravadas sem "Z". */
    static final class Deserializer extends JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
            TemporalAccessor parsed = DateTimeFormatter.ISO_DATE_TIME
                    .parseBest(p.getValueAsString(), OffsetDateTime::from, LocalDateTime::from);
            return parsed instanceof OffsetDateTime odt
                    ? odt.withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime()
                    : (LocalDateTime) parsed;
        }
    }
}
