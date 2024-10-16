import api from './api'; // Adjust the import path as needed

// Function to check if the user is authenticated
export const checkAuthentication = async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await api.post('/api/verify-token', { token });
            return response.data.valid; 
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }
    return false;
};