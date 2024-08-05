package com.example.finalTest.finalTest;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/test")
public class PostController {
    private final PostService postService;

    @GetMapping
    private ResponseEntity<?> getPostList(@RequestHeader(value = "Page", required = false) Integer page){
        if (page == null || page < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("해당 페이지를 찾을 수 없습니다.");
        }
        Page<PostResponseDTO> postList = postService.getAll(page);
        return ResponseEntity.status (HttpStatus.OK).body (postList);
    }

    @PostMapping
    private ResponseEntity<?> createPost(@RequestBody PostRequestDTO postRequestDTO){
        PostResponseDTO postResponseDTO = postService.create(postRequestDTO);
        return ResponseEntity.status (HttpStatus.OK).body (postResponseDTO);
    }

    @PutMapping
    private ResponseEntity<?> updatePost(@RequestHeader("id") Long id, @RequestBody PostRequestDTO postRequestDTO){
        PostResponseDTO postResponseDTO = postService.update(id, postRequestDTO);
        return ResponseEntity.status (HttpStatus.OK).body (postResponseDTO);
    }

    @DeleteMapping
    private ResponseEntity<?> deletePost(@RequestHeader("id") Long id){
        postService.delete(id);
        return ResponseEntity.status (HttpStatus.OK).body ("DELETE SUCCESS");
    }

    @GetMapping("/get")
    private ResponseEntity<?> getPost(@RequestHeader("id") Long id){
        PostResponseDTO postResponseDTO = postService.getPostById(id);
        return ResponseEntity.status (HttpStatus.OK).body (postResponseDTO);
    }

}
