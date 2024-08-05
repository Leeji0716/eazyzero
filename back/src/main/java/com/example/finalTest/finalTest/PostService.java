package com.example.finalTest.finalTest;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    public Page<PostResponseDTO> getAll(int page) {
        List<Post> postList = postRepository.findAll();
        Pageable pageable = PageRequest.of(page, 10);
        Page<PostResponseDTO> postPage = getPostList(postList, pageable);
        return postPage;
    }

    private Page<PostResponseDTO> getPostList(List<Post> postList, Pageable pageable) {
        List<PostResponseDTO> responseDTOList = postList.stream()
                .map(this::returnPostDTO)
                .sorted((p1, p2) -> p2.id().compareTo(p1.id()))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responseDTOList.size());
        List<PostResponseDTO> pagedList = responseDTOList.subList(start, end);

        return new PageImpl<>(pagedList, pageable, responseDTOList.size());
    }

    public PostResponseDTO returnPostDTO(Post post) {
        PostResponseDTO postResponseDTO = PostResponseDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .build();

        return postResponseDTO;
    }

    public PostResponseDTO create(PostRequestDTO postRequestDTO) {
        Post post = new Post();
        post.setTitle(postRequestDTO.title());
        post.setContent(postRequestDTO.content());
        postRepository.save(post);

        return returnPostDTO(post);
    }

    public PostResponseDTO update(Long id, PostRequestDTO postRequestDTO) {
        Post post = postRepository.findById(id).get();
        post.setTitle(postRequestDTO.title());
        post.setContent(postRequestDTO.content());

        postRepository.save(post);

        return returnPostDTO(post);
    }

    public void delete(Long id) {
        Post post = postRepository.findById(id).get();

        postRepository.delete(post);
    }

    public PostResponseDTO getPostById(Long id) {
        Post post = postRepository.findById(id).get();

        return returnPostDTO(post);
    }
}
