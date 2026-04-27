const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * API Service для взаимодействия с backend
 */

// Chat API
export const chatAPI = {
  sendMessage: async (message, employeeId = null) => {
    const response = await fetch(`${API_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, employeeId })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  getHistory: async (employeeId) => {
    const response = await fetch(`${API_URL}/chat/history/${employeeId}`);

    if (!response.ok) {
      throw new Error('Failed to get chat history');
    }

    return response.json();
  }
};

// Employee API
export const employeeAPI = {
  getEmployee: async (employeeId) => {
    const response = await fetch(`${API_URL}/employee/${employeeId}`);

    if (!response.ok) {
      throw new Error('Failed to get employee data');
    }

    return response.json();
  },

  getVacation: async (employeeId) => {
    const response = await fetch(`${API_URL}/employee/${employeeId}/vacation`);

    if (!response.ok) {
      throw new Error('Failed to get vacation data');
    }

    return response.json();
  },

  auth: async (employeeId, email) => {
    const response = await fetch(`${API_URL}/employee/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, email })
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return response.json();
  },

  getBirthday: async (employeeId) => {
    const response = await fetch(`${API_URL}/employee/${employeeId}/birthday`);

    if (!response.ok) {
      throw new Error('Failed to get birthday data');
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

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to get documents');
    }

    return response.json();
  },

  getDocument: async (documentId) => {
    const response = await fetch(`${API_URL}/documents/${documentId}`);

    if (!response.ok) {
      throw new Error('Failed to get document');
    }

    return response.json();
  },

  uploadDocument: async (file, title, category, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('type', type);

    const response = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    return response.json();
  },

  deleteDocument: async (documentId) => {
    const response = await fetch(`${API_URL}/documents/${documentId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }

    return response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_URL}/documents/meta/categories`);

    if (!response.ok) {
      throw new Error('Failed to get categories');
    }

    return response.json();
  }
};

// Knowledge Base API
export const knowledgeAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/knowledge`);

    if (!response.ok) {
      throw new Error('Failed to get knowledge base');
    }

    return response.json();
  },

  search: async (query) => {
    const response = await fetch(`${API_URL}/knowledge/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error('Failed to search knowledge base');
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
  chatAPI,
  employeeAPI,
  documentsAPI,
  knowledgeAPI,
  healthCheck
};
