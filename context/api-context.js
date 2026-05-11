"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

// Define the base API URL - replace with your actual API URL in production
const API_BASE_URL =
  // "https://ffc9amxie7.execute-api.ap-south-1.amazonaws.com/api/v1";
  "http://localhost:4000/api/v1";

// Create the API context
const ApiContext = createContext(undefined);

export function ApiProvider({ children }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState({});

  // Helper function to build headers with authentication
  const getHeaders = useCallback(() => {
    const headers = {
      "Content-Type": "application/json",
    };

    // Try to get token from localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.token) {
          headers["Authorization"] = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error("Error accessing token:", error);
    }

    return headers;
  }, []);

  // Generic fetch function with error handling
  const fetchApi = useCallback(
    async (endpoint, options = {}) => {
      const requestId = `${options.method || "GET"}_${endpoint}_${Date.now()}`;

      try {
        setLoading((prev) => ({ ...prev, [requestId]: true }));

        const url = endpoint.startsWith("http")
          ? endpoint
          : `${API_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
          ...options,
          headers: {
            ...getHeaders(),
            ...options.headers,
          },
        });

        // Handle non-2xx responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `API request failed with status ${response.status}`
          );
        }

        // Parse JSON response if content exists
        const contentType = response.headers.get("content-type");
        if (
          contentType &&
          contentType.includes("application/json") &&
          response.status !== 204
        ) {
          return await response.json();
        }

        return null;
      } catch (error) {
        // Show error toast
        toast({
          title: "API Error",
          description:
            error.message || "An error occurred while making the API request",
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading((prev) => ({ ...prev, [requestId]: false }));
      }
    },
    [getHeaders, toast]
  );

  // CRUD operations
  const get = useCallback(
    (endpoint, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      return fetchApi(url, { method: "GET" });
    },
    [fetchApi]
  );

  const post = useCallback(
    (endpoint, data) => {
      return fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    [fetchApi]
  );

  const put = useCallback(
    (endpoint, data) => {
      return fetchApi(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    [fetchApi]
  );

  const patch = useCallback(
    (endpoint, data) => {
      return fetchApi(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    [fetchApi]
  );

  const del = useCallback(
    (endpoint) => {
      return fetchApi(endpoint, { method: "DELETE" });
    },
    [fetchApi]
  );

  // Check if a specific request is loading
  const isLoading = useCallback(
    (endpoint, method = "GET") => {
      const requestId = `${method}_${endpoint}_${Date.now()}`;
      return !!loading[requestId];
    },
    [loading]
  );

  // Upload file function
  const uploadFile = useCallback(
    async (endpoint, file, additionalData = {}) => {
      const formData = new FormData();
      formData.append("file", file);

      // Add any additional data to the form
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      return fetchApi(endpoint, {
        method: "POST",
        headers: {
          // Don't set Content-Type here, it will be set automatically with the boundary
          ...getHeaders(),
        },
        body: formData,
      });
    },
    [fetchApi, getHeaders]
  );

  // Context value
  const value = {
    get,
    post,
    put,
    patch,
    delete: del, // 'delete' is a reserved word, so we use 'del' internally
    uploadFile,
    isLoading,
    baseUrl: API_BASE_URL,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

// Custom hook to use the API context
export function useApi() {
  const context = useContext(ApiContext);

  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }

  return context;
}
