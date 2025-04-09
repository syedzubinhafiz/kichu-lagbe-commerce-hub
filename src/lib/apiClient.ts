import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
  // The proxy in vite.config.js handles the base URL during development
  // For production builds, you might need to set baseURL explicitly:
  // baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Important to send cookies (like the refreshToken)
});

// Define public routes (or patterns)
const publicRoutes = [
  '/api/products', // GET products list
  // Add other public GET routes here, e.g., '/api/products/:slug', '/api/categories'
  // Use startsWith for patterns like /api/products/...
];

// Request interceptor to add the auth token header ONLY to non-public requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    // Check if the request URL matches any public route pattern
    const isPublicRoute = publicRoutes.some(route => 
      (config.url?.startsWith(route) && config.method?.toLowerCase() === 'get') ||
      // Add more specific checks if needed, e.g., regex for slugs
      (route.includes(':') && new RegExp(`^${route.replace(/\:[^\/]+/g, '[^\/]+')}$`).test(config.url || '') && config.method?.toLowerCase() === 'get')
    );

    // --- DEBUG LOGGING START ---
    console.log('[API Interceptor] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      isPublic: isPublicRoute,
      tokenExists: !!token,
      sendingAuthHeader: token && !isPublicRoute
    });
    // --- DEBUG LOGGING END ---

    // Only add Authorization header if a token exists AND it's NOT a public GET route
    if (token && !isPublicRoute) {
      console.log('[API Interceptor] Attaching Auth Header');
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional but recommended for handling token refresh)
// This is a basic example; real-world usage might involve queuing requests
// while refreshing the token.
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      // Assuming the failed request config is stored in prom.config
      // You might need to adjust this part based on how you structure the promise
      // prom.config.headers['Authorization'] = 'Bearer ' + token;
      // apiClient(prom.config).then(prom.resolve).catch(prom.reject);
      // Simplified: For now, just reject all queued requests on error
      // A full implementation would retry requests with the new token
      prom.reject(new Error('Token refresh failed, please log in again.'));
    }
  });
  failedQueue = [];
};


apiClient.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Check if error is 401 (Unauthorized) and not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token is already refreshing, queue the request
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).catch(err => {
            return Promise.reject(err); // Propagate the error after queuing
        });
      }

      originalRequest._retry = true; // Mark as retry
      isRefreshing = true;

      try {
        // Call the refresh token endpoint
        const { data } = await axios.post('/api/auth/refresh', {}, {
            withCredentials: true // Ensure cookies are sent for refresh
        });
        const newAccessToken = data.accessToken;

        // Store the new token
        localStorage.setItem('accessToken', newAccessToken);

        // Update the header for the original request and retry
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

        processQueue(null, newAccessToken);
        isRefreshing = false;
        return apiClient(originalRequest); // Retry original request with new token

      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login (or handle as appropriate)
        localStorage.removeItem('accessToken');
        // Maybe clear user from state management too
        // window.location.href = '/login'; // Or use router navigation
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    // Any status codes that falls outside the range of 2xx cause this function to trigger
    return Promise.reject(error);
  }
);


export default apiClient; 