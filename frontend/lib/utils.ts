// Utility function to handle authenticated navigation
export const navigateWithAuth = (router: any, path: string, isAuthenticated: boolean) => {
    if (!isAuthenticated) {
        localStorage.setItem('redirectAfterLogin', path);
        router.push('/login');
        return false; // Not authenticated, navigation handled
    }
    router.push(path);
    return true; // Authenticated, navigation completed
};