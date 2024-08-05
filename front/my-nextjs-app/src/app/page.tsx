"use client";

import { useEffect, useRef, useState } from "react";
import { createPost, deletePost, getPost, updatePost } from "./API/UserAPI";

export default function Home() {
  interface PostResponseDTO {
    id: number;
    title: string;
    content: string;
  }

  interface PostRequestDTO {
    title: string;
    content: string;
  }

  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [postList, setPostList] = useState<PostResponseDTO[]>([]);
  const [post, setPost] = useState<PostResponseDTO | null>(null);
  const [viewMode, setViewMode] = useState(0); // 0: 메인, 1: 작성 폼, 2: 상세 보기
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [temp, setTemp] = useState(0);
  const [sky, setSky] = useState(0);
  const [skyStr, setSkyStr] = useState("");
  const [nowTime, setNowTime] = useState(0);
  const postRef = useRef<HTMLDivElement>(null);

  const API_KEY = 'UHNLynqKoHmvrLZldIw2FZANya6Mixi90eXoLI6aIrpgLddj9gaFBdXSfWRbi3CRg%2BOJp%2Fmwz0P%2BkiN%2FeQ9Piw%3D%3D';
  // 기본 위치 (서울) 설정
  const DEFAULT_LAT = 36;
  const DEFAULT_LON = 127;

  const getWeather = (lat: number, lon: number) => {
    fetch(
      `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=20240805&base_time=${nowTime}00&nx=${lat}&ny=${lon}`
    )
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setTemp(data.response.body.items.item[24].fcstValue);
        setSky(data.response.body.items.item[18].fcstValue);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
      });
  };

  useEffect(() => {
    if (sky == 1) {
      setSkyStr("맑음");
    } else if (sky == 3) {
      setSkyStr("구름많음");
    } else if (sky == 4) {
      setSkyStr("흐림");
    } else {
      setSkyStr("없음");
    }
  }, [sky]);

  getWeather(DEFAULT_LAT, DEFAULT_LON);

  const getCurrentHour = () => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours() - 1; // 숫자 형태로 현재 시간을 가져옴
    return currentHour * 100;
  };

  useEffect(() => {
    const currentHour = getCurrentHour();
    setNowTime(currentHour);
    if (viewMode === 0) {
      loadInitialPosts();
    }
  }, [viewMode]);

  const loadInitialPosts = async () => {
    try {
      const response = await getPost(page);
      setPostList(response.content);
      setMaxPage(response.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMorePosts = async () => {
    if (isLoading || page >= maxPage) return;

    setIsLoading(true);
    try {
      const response = await getPost(page + 1);
      if (response.size > 0) {
        setPage(prevPage => prevPage + 1);
        setPostList(prevList => [...prevList, ...response.content]);
        setMaxPage(response.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const postbox = postRef.current;
      if (postbox) {
        const scrollPosition = postbox.scrollTop + postbox.clientHeight;
        const threshold = postbox.scrollHeight - 50; // Adjust the threshold as needed
        if (scrollPosition >= threshold) {
          loadMorePosts();
        }
      }
    };

    const postbox = postRef.current;
    if (postbox) {
      postbox.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (postbox) {
        postbox.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isLoading, page, maxPage, viewMode]);

  const handleCreateClick = () => {
    setViewMode(1); // 작성 모드로 전환
    setTitle("");
    setContent("");
  };

  const handleLogoClick = () => {
    setViewMode(0); // 메인 페이지로 전환
    setPage(0); // 페이지 초기화
  };

  const handlePostClick = (selectedPost: PostResponseDTO) => {
    setPost(selectedPost);
    setTitle(selectedPost.title);
    setContent(selectedPost.content);
    setViewMode(2); // 상세 페이지로 전환
  };

  const handleBackClick = () => {
    setPage(0);
    setViewMode(0); // 메인 페이지로 전환
    setPost(null); // 포스트 상태 초기화
    setTitle("");
    setContent("");
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const postRequestDTO: PostRequestDTO = { title, content };
      const response = await createPost(postRequestDTO);
      setPostList(prevList => [...prevList, response]);
      handleBackClick();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (post) {
      try {
        const postRequestDTO: PostRequestDTO = { title, content };
        const response = await updatePost(postRequestDTO, post.id);
        setPost(response);
        setPostList(prevList => prevList.map(p => (p.id === response.id ? response : p)));
        handleBackClick();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteClick = async () => {
    if (post) {
      try {
        await deletePost(post.id);
        setPostList(prevList => prevList.filter(p => p.id !== post.id));
        setPost(null); // 포스트 상태 초기화
        setTitle("");
        setContent("");
        handleBackClick();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="flex border-black border-b-4 items-center justify-between p-4 sm:p-6 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl cursor-pointer" onClick={handleLogoClick}>LOGO</h2>
        </div>
        <div className="text-sm sm:text-base">
          날씨 : {skyStr} ({temp}도)
        </div>
        <div className="flex space-x-2 sm:space-x-4">
          <button className="cursor-pointer p-1 sm:p-2" onClick={handleCreateClick}>
            글 작성
          </button>
          <button className="cursor-pointer p-1 sm:p-2">Login</button>
          <button className="cursor-pointer p-1 sm:p-2">Sign up</button>
        </div>
      </div>

      {viewMode === 1 && (
        <div className="flex flex-col items-center">
          <h2 className="text-xl mb-4">글 작성 폼</h2>
          <div className="w-[60%]">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label>
              <input
                type="text"
                id="title"
                name="title"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border-2 border-gray-300"
                placeholder="제목을 입력해주세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">내용</label>
              <textarea
                id="content"
                name="content"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border-2 border-gray-300 h-[500px]"
                placeholder="내용을 입력해주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>
            <button className="p-2 bg-blue-500 text-white rounded-md" onClick={handleCreatePost}>제출</button>
            <button
              className="mt-2 p-2 bg-gray-500 text-white rounded-md"
              onClick={handleBackClick}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {viewMode === 2 && post && (
        <div className="flex flex-col items-center">
          <h2 className="text-xl mb-4">글 상세 보기</h2>
          <div className="w-[60%]">
            <div className="mb-4">
              <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700">제목</label>
              <input
                type="text"
                id="editTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border-2 border-gray-300"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editContent" className="block text-sm font-medium text-gray-700">내용</label>
              <textarea
                id="editContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm border-2 border-gray-300 h-[500px]"
              ></textarea>
            </div>
            <button
              type="submit"
              className="mt-4 p-2 bg-blue-500 text-white rounded-md"
              onClick={handleUpdateClick}
            >
              수정
            </button>
            <button
              className="mt-4 p-2 bg-red-500 text-white rounded-md"
              onClick={handleDeleteClick}
            >
              삭제
            </button>
            <button
              className="mt-4 p-2 bg-gray-500 text-white rounded-md"
              onClick={handleBackClick}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {viewMode === 0 && (
        <div className='flex items-center justify-center'>
          <div ref={postRef} className="w-full max-w-[900px] h-[800px] flex flex-wrap gap-4 items-center overflow-y-auto">
            {postList.map((post) => (
              <div
                key={post.id}
                className='w-full sm:w-[48%] md:w-[30%] h-[300px] bg-gray-300 flex items-center justify-center mb-4 hover:bg-gray-500 cursor-pointer'
                onClick={() => handlePostClick(post)}
              >
                <span>{post.title}</span>
              </div>
            ))}
            {isLoading && <div className="w-full text-center p-4">Loading...</div>}
          </div>
        </div>
      )}
    </div>
  );
}
