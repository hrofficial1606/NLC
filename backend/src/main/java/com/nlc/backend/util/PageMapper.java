package com.nlc.backend.util;

import com.nlc.backend.dto.common.PageResponse;
import java.util.List;
import java.util.function.Function;
import org.springframework.data.domain.Page;

public final class PageMapper {

    private PageMapper() {
    }

    public static <T, R> PageResponse<R> toResponse(Page<T> page, Function<T, R> mapper) {
        List<R> content = page.stream().map(mapper).toList();
        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
