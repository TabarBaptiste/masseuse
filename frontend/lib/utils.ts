import { NextRouter } from 'next/router';

// Utility function to handle authenticated navigation
export const navigateWithAuth = (router: NextRouter, path: string, isAuthenticated: boolean) => {
    if (!isAuthenticated) {
        localStorage.setItem('redirectAfterLogin', path);
        router.push('/login');
        return false; // Not authenticated, navigation handled
    }
    router.push(path);
    return true; // Authenticated, navigation completed
};
