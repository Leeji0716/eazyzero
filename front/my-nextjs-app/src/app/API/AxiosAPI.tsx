import axios from 'axios';

export function getAPI() {
    const api = axios.create({
        baseURL: 'http://localhost:8999',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
    return api;
}
