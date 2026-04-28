# API Документация для Форума

## Базовый URL
```
http://localhost:3000/api
```

## Аутентификация

Все защищенные эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

---

## 1. Аутентификация

### POST /auth/register
Регистрация нового пользователя

**Request:**
```json
{
  "employeeId": "12345",
  "email": "user@company.ru",
  "password": "password123",
  "fullName": "Иванов Иван Иванович"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "employeeId": "12345",
    "email": "user@company.ru",
    "fullName": "Иванов Иван Иванович",
    "avatar": null,
    "role": "user",
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

### POST /auth/login
Вход в систему

**Request:**
```json
{
  "login": "12345",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "employeeId": "12345",
    "email": "user@company.ru",
    "fullName": "Иванов Иван Иванович",
    "avatar": null,
    "role": "user"
  }
}
```

---

## 2. Категории форума

### GET /forum/categories
Получить все категории

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Адаптация",
      "slug": "adaptation",
      "description": "Вопросы по адаптации новых сотрудников",
      "icon": "🌱",
      "color": "#2F4A39",
      "topicsCount": 45,
      "postsCount": 234
    },
    {
      "id": 2,
      "name": "Общение",
      "slug": "chat",
      "description": "Общие темы для обсуждения",
      "icon": "💬",
      "color": "#8FB996",
      "topicsCount": 128,
      "postsCount": 892
    }
  ]
}
```

### POST /forum/categories
Создать категорию (только админ)

**Request:**
```json
{
  "name": "Новая категория",
  "slug": "new-category",
  "description": "Описание категории",
  "icon": "📚",
  "color": "#2F4A39"
}
```

---

## 3. Темы (Topics)

### GET /forum/topics
Получить список тем

**Query Parameters:**
- `categoryId` (optional) - фильтр по категории
- `page` (optional, default: 1) - номер страницы
- `limit` (optional, default: 20) - количество на странице
- `sort` (optional, default: "latest") - сортировка: "latest", "popular", "oldest"

**Response:**
```json
{
  "success": true,
  "topics": [
    {
      "id": 1,
      "title": "Как проходит первый день?",
      "slug": "kak-prohodit-pervyj-den",
      "content": "Расскажите, как у вас прошел первый день в компании...",
      "categoryId": 1,
      "category": {
        "id": 1,
        "name": "Адаптация",
        "slug": "adaptation",
        "icon": "🌱"
      },
      "author": {
        "id": 1,
        "fullName": "Иванов Иван",
        "avatar": null,
        "position": "Junior Developer"
      },
      "isPinned": false,
      "isLocked": false,
      "viewsCount": 156,
      "repliesCount": 12,
      "likesCount": 8,
      "createdAt": "2026-04-27T10:00:00Z",
      "updatedAt": "2026-04-28T09:30:00Z",
      "lastReply": {
        "id": 45,
        "author": {
          "id": 5,
          "fullName": "Петров Петр"
        },
        "createdAt": "2026-04-28T09:30:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 173,
    "pages": 9
  }
}
```

### GET /forum/topics/:id
Получить тему по ID

**Response:**
```json
{
  "success": true,
  "topic": {
    "id": 1,
    "title": "Как проходит первый день?",
    "slug": "kak-prohodit-pervyj-den",
    "content": "Расскажите, как у вас прошел первый день в компании...",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Адаптация",
      "slug": "adaptation",
      "icon": "🌱"
    },
    "author": {
      "id": 1,
      "fullName": "Иванов Иван Иванович",
      "avatar": null,
      "position": "Junior Developer",
      "department": "IT"
    },
    "isPinned": false,
    "isLocked": false,
    "viewsCount": 156,
    "repliesCount": 12,
    "likesCount": 8,
    "isLikedByUser": false,
    "createdAt": "2026-04-27T10:00:00Z",
    "updatedAt": "2026-04-28T09:30:00Z"
  }
}
```

### POST /forum/topics
Создать новую тему

**Request:**
```json
{
  "title": "Заголовок темы",
  "content": "Содержание темы...",
  "categoryId": 1
}
```

**Response:**
```json
{
  "success": true,
  "topic": {
    "id": 123,
    "title": "Заголовок темы",
    "slug": "zagolovok-temy",
    "content": "Содержание темы...",
    "categoryId": 1,
    "authorId": 1,
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

### PUT /forum/topics/:id
Обновить тему (только автор или админ)

**Request:**
```json
{
  "title": "Обновленный заголовок",
  "content": "Обновленное содержание..."
}
```

### DELETE /forum/topics/:id
Удалить тему (только автор или админ)

### POST /forum/topics/:id/like
Поставить/убрать лайк теме

**Response:**
```json
{
  "success": true,
  "isLiked": true,
  "likesCount": 9
}
```

### POST /forum/topics/:id/pin
Закрепить тему (только админ)

### POST /forum/topics/:id/lock
Заблокировать тему (только админ)

---

## 4. Ответы (Replies)

### GET /forum/topics/:topicId/replies
Получить ответы к теме

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "success": true,
  "replies": [
    {
      "id": 1,
      "content": "Отличный вопрос! У меня первый день прошел...",
      "topicId": 1,
      "author": {
        "id": 2,
        "fullName": "Петров Петр",
        "avatar": null,
        "position": "Middle Developer"
      },
      "likesCount": 5,
      "isLikedByUser": false,
      "createdAt": "2026-04-27T11:00:00Z",
      "updatedAt": "2026-04-27T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

### POST /forum/topics/:topicId/replies
Создать ответ

**Request:**
```json
{
  "content": "Текст ответа..."
}
```

**Response:**
```json
{
  "success": true,
  "reply": {
    "id": 45,
    "content": "Текст ответа...",
    "topicId": 1,
    "authorId": 1,
    "createdAt": "2026-04-28T10:00:00Z"
  }
}
```

### PUT /forum/replies/:id
Обновить ответ (только автор или админ)

**Request:**
```json
{
  "content": "Обновленный текст ответа..."
}
```

### DELETE /forum/replies/:id
Удалить ответ (только автор или админ)

### POST /forum/replies/:id/like
Поставить/убрать лайк ответу

---

## 5. Поиск

### GET /forum/search
Поиск по форуму

**Query Parameters:**
- `q` (required) - поисковый запрос
- `type` (optional) - "topics" или "all" (default: "all")
- `categoryId` (optional) - фильтр по категории

**Response:**
```json
{
  "success": true,
  "results": {
    "topics": [
      {
        "id": 1,
        "title": "Как проходит первый день?",
        "excerpt": "...первый день в компании...",
        "category": {
          "id": 1,
          "name": "Адаптация"
        },
        "author": {
          "fullName": "Иванов Иван"
        },
        "createdAt": "2026-04-27T10:00:00Z"
      }
    ],
    "replies": [
      {
        "id": 5,
        "content": "...текст ответа...",
        "topicId": 1,
        "topicTitle": "Как проходит первый день?",
        "author": {
          "fullName": "Петров Петр"
        },
        "createdAt": "2026-04-27T11:00:00Z"
      }
    ]
  }
}
```

---

## 6. Пользователи

### GET /forum/users/:id
Получить профиль пользователя

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "employeeId": "12345",
    "fullName": "Иванов Иван Иванович",
    "email": "ivanov@company.ru",
    "avatar": null,
    "position": "Junior Developer",
    "department": "IT",
    "bio": "О себе...",
    "joinedAt": "2026-04-01T00:00:00Z",
    "stats": {
      "topicsCount": 5,
      "repliesCount": 23,
      "likesReceived": 45
    }
  }
}
```

### PUT /forum/users/:id
Обновить профиль (только свой)

**Request:**
```json
{
  "bio": "Новое описание...",
  "avatar": "base64_image_or_url"
}
```

### GET /forum/users/:id/topics
Получить темы пользователя

### GET /forum/users/:id/replies
Получить ответы пользователя

---

## 7. Уведомления

### GET /forum/notifications
Получить уведомления текущего пользователя

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "type": "reply",
      "message": "Петров Петр ответил на вашу тему",
      "data": {
        "topicId": 1,
        "topicTitle": "Как проходит первый день?",
        "replyId": 45
      },
      "isRead": false,
      "createdAt": "2026-04-28T09:30:00Z"
    },
    {
      "id": 2,
      "type": "like",
      "message": "Сидоров Сидор оценил ваш ответ",
      "data": {
        "topicId": 1,
        "replyId": 12
      },
      "isRead": true,
      "createdAt": "2026-04-28T08:00:00Z"
    }
  ],
  "unreadCount": 1
}
```

### POST /forum/notifications/:id/read
Отметить уведомление как прочитанное

### POST /forum/notifications/read-all
Отметить все уведомления как прочитанные

---

## 8. Статистика

### GET /forum/stats
Получить общую статистику форума

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTopics": 173,
    "totalReplies": 892,
    "totalUsers": 45,
    "activeUsers": 12,
    "topCategories": [
      {
        "id": 1,
        "name": "Адаптация",
        "topicsCount": 45
      }
    ],
    "recentActivity": [
      {
        "type": "topic",
        "id": 123,
        "title": "Новая тема",
        "author": "Иванов Иван",
        "createdAt": "2026-04-28T10:00:00Z"
      }
    ]
  }
}
```

---

## Коды ошибок

- `400` - Bad Request (неверные данные)
- `401` - Unauthorized (не авторизован)
- `403` - Forbidden (нет прав доступа)
- `404` - Not Found (ресурс не найден)
- `500` - Internal Server Error (ошибка сервера)

**Формат ошибки:**
```json
{
  "success": false,
  "error": "Описание ошибки"
}
```
