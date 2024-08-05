package com.example.finalTest.finalTest;

import lombok.Builder;

@Builder
    public record PostResponseDTO(Long id, String title, String content) {
}
