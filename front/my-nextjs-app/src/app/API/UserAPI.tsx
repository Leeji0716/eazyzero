import { headers } from 'next/headers';
import { getAPI } from './AxiosAPI';

export const UserApi = getAPI();

interface postRequestDTO {
    title: string,
    content: string;
}

export const createPost = async (postRequestDTO: postRequestDTO) => {
    const response = await UserApi.post('/test', postRequestDTO);
    return response.data;
};

export const getPost = async (page: number) => {
    const response = await UserApi.get('/test', {
        headers: {
            page: page
        }
    });
    return response.data;
};

export const updatePost = async (postRequestDTO: postRequestDTO, id: number) => {
    const response = await UserApi.put('/test', postRequestDTO, {
        headers: {
            id: id
        }
    });
    return response.data;
};
export const deletePost = async (id: number) => {
    const response = await UserApi.delete('/test', {
        headers: {
            id: id
        }
    });
    return response.data;
};
