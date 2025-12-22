import { getApiUrl } from '../utils/api';

const API_BASE_URL = getApiUrl();

export interface Comment {
    _id?: string;
    user: string;
    name: string;
    text: string;
    date: string;
}

export interface News {
    _id: string;
    title: string;
    excerpt: string;
    coverImage: string;
    content: any[];
    status: string;
    views: number;
    createdAt: string;
    likes: string[];
    comments: Comment[];
    type?: 'News' | 'Program';
}

export interface NewsResponse {
    success: boolean;
    count: number;
    data: News[];
}

export const newsAPI = {
    async getAllNews(): Promise<NewsResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/news`);
            if (!response.ok) throw new Error('Failed to fetch news');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching news:', error);
            throw error;
        }
    },

    async getNewsById(id: string): Promise<{ success: boolean; data: News }> {
        try {
            const response = await fetch(`${API_BASE_URL}/news/${id}`);
            if (!response.ok) throw new Error('Failed to fetch news details');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching news by ID:', error);
            throw error;
        }
    },

    async toggleLike(id: string, userId: string, username: string): Promise<{ success: boolean; data: string[]; points?: number; firstLike?: boolean }> {
        try {
            const response = await fetch(`${API_BASE_URL}/news/${id}/like`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, username }),
            });
            if (!response.ok) throw new Error('Failed to toggle like');
            return await response.json();
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    },

    async addComment(id: string, text: string, userId: string, name: string, username: string): Promise<{ success: boolean; data: Comment[]; points?: number; firstComment?: boolean }> {
        try {
            const response = await fetch(`${API_BASE_URL}/news/${id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, userId, name, username }),
            });
            if (!response.ok) throw new Error('Failed to add comment');
            return await response.json();
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    async shareNews(id: string, userId: string, username: string): Promise<{ success: boolean; points?: number; firstShare?: boolean }> {
        try {
            const response = await fetch(`${API_BASE_URL}/news/${id}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, username }),
            });
            if (!response.ok) throw new Error('Failed to track share');
            return await response.json();
        } catch (error) {
            console.error('Error tracking share:', error);
            throw error;
        }
    },
};
