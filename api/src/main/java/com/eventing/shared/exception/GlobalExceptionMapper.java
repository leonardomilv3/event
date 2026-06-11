package com.eventing.shared.exception;

import com.eventing.shared.response.ApiResponse;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<ApiException> {

    @Override
    public Response toResponse(ApiException exception) {
        return Response
                .status(exception.getStatus())
                .entity(ApiResponse.error(exception.getMessage()))
                .type(MediaType.APPLICATION_JSON)
                .build();
    }
}
