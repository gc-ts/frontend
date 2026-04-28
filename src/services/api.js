const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * API Service для взаимодействия с backend
 */

// Получение токена из localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Создание заголовков с авторизацией
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Auth API
export const authAPI = {
  register: async (employeeId, email, password, fullName) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, email, password, fullName })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  login: async (login, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  verify: async (token) => {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return response.json();
  }
};

// Chat API
export const chatAPI = {
  sendMessage: async (message, employeeId = null) => {
    const response = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, employeeId })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  sendMessageStream: async (message, employeeId = null, onChunk) => {
    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, employeeId })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (onChunk) onChunk(parsed);
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  },

  getHistory: async (employeeId) => {
    const response = await fetch(`${API_URL}/chat/history/${employeeId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get chat history');
    }

    return response.json();
  }
};

// Employee API
export const employeeAPI = {
  getEmployee: async (employeeId) => {
    const response = await fetch(`${API_URL}/employee/${employeeId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get employee data');
    }

    return response.json();
  },

  getVacation: async (employeeId) => {
    const response = await fetch(`${API_URL}/employee/${employeeId}/vacation`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get vacation data');
    }

    return response.json();
  },

  auth: async (employeeId, email) => {
    const response = await fetch(`${API_URL}/employee/auth`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ employeeId, email })
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return response.json();
  },

  getBirthday: async (employeeId) => {
    const response = await fetch(`${API_URL}/employee/${employeeId}/birthday`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get birthday data');
    }

    return response.json();
  },

  searchByName: async (name) => {
    const response = await fetch(`${API_URL}/employee/search/by-name?name=${encodeURIComponent(name)}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to search employee');
    }

    return response.json();
  }
};

// Documents API
export const documentsAPI = {
  getDocuments: async (category = null, type = null) => {
    let url = `${API_URL}/documents`;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (type) params.append('type', type);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get documents');
    }

    return response.json();
  },

  getDocument: async (documentId) => {
    const response = await fetch(`${API_URL}/documents/${documentId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get document');
    }

    return response.json();
  },

  uploadDocument: async (file, title, category, type) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('type', type);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    return response.json();
  },

  deleteDocument: async (documentId) => {
    const response = await fetch(`${API_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }

    return response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_URL}/documents/meta/categories`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get categories');
    }

    return response.json();
  }
};

// Knowledge Base API
export const knowledgeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/knowledge`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get knowledge base');
    }

    return response.json();
  },

  search: async (query) => {
    const response = await fetch(`${API_URL}/knowledge/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Failed to search knowledge base');
    }

    return response.json();
  },

  reindex: async () => {
    const response = await fetch(`${API_URL}/knowledge/reindex`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to reindex knowledge base');
    }

    return response.json();
  },

  getIndexStatus: async () => {
    const response = await fetch(`${API_URL}/knowledge/index`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get index status');
    }

    return response.json();
  }
};

// Health Check
export const healthCheck = async () => {
  const response = await fetch(`${API_URL.replace('/api', '')}/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
};

export default {
  authAPI,
  chatAPI,
  employeeAPI,
  documentsAPI,
  knowledgeAPI,
  healthCheck
};
