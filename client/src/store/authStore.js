import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user_data')) || null,
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: !!localStorage.getItem('auth_token'),
    isLoading: false,
    error: null,

    login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password, role });
            const { token, user } = response.data;

            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(user));

            set({
                token,
                user,
                isAuthenticated: true,
                isLoading: false
            });

            return user;
        } catch (error) {
            set({
                error: error.response?.data?.error || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    // Used to update user data without logging in again (e.g., after plan change)
    updateUser: (newUserData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...newUserData };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        set({ user: updatedUser });
    }
}));

export default useAuthStore;
