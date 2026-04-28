import { useState, useEffect } from 'react'

// Моковые данные для демонстрации
const MOCK_CATEGORIES = [
  {
    id: 1,
    name: 'Адаптация',
    slug: 'adaptation',
    description: 'Вопросы по адаптации новых сотрудников',
    icon: '🌱',
    color: '#2F4A39',
    topicsCount: 45,
    postsCount: 234
  },
  {
    id: 2,
    name: 'Общение',
    slug: 'chat',
    description: 'Общие темы для обсуждения',
    icon: '💬',
    color: '#8FB996',
    topicsCount: 128,
    postsCount: 892
  },
  {
    id: 3,
    name: 'Вопросы HR',
    slug: 'hr',
    description: 'Вопросы по кадрам и документам',
    icon: '📋',
    color: '#46624F',
    topicsCount: 67,
    postsCount: 345
  },
  {
    id: 4,
    name: 'Обучение',
    slug: 'learning',
    description: 'Курсы, тренинги, развитие',
    icon: '📚',
    color: '#B7CFAF',
    topicsCount: 89,
    postsCount: 456
  },
  {
    id: 5,
    name: 'Офис',
    slug: 'office',
    description: 'Всё про офисную жизнь',
    icon: '🏢',
    color: '#6E7A6E',
    topicsCount: 34,
    postsCount: 178
  }
];

const MOCK_TOPICS = [
  {
    id: 1,
    title: 'Как проходит первый день в компании?',
    slug: 'kak-prohodit-pervyj-den',
    content: 'Привет всем! Завтра мой первый день. Расскажите, как обычно проходит первый день? Что нужно взять с собой? К кому обращаться?',
    categoryId: 1,
    author: {
      id: 1,
      fullName: 'Иванов Иван',
      avatar: null,
      position: 'Junior Developer'
    },
    isPinned: true,
    isLocked: false,
    viewsCount: 156,
    repliesCount: 12,
    likesCount: 8,
    createdAt: new Date('2026-04-27T10:00:00Z'),
    updatedAt: new Date('2026-04-28T09:30:00Z')
  },
  {
    id: 2,
    title: 'Где лучше обедать рядом с офисом?',
    slug: 'gde-luchshe-obedat',
    content: 'Коллеги, подскажите хорошие места для обеда недалеко от офиса. Желательно недорого и вкусно :)',
    categoryId: 5,
    author: {
      id: 2,
      fullName: 'Петрова Мария',
      avatar: null,
      position: 'Designer'
    },
    isPinned: false,
    isLocked: false,
    viewsCount: 89,
    repliesCount: 23,
    likesCount: 15,
    createdAt: new Date('2026-04-26T14:00:00Z'),
    updatedAt: new Date('2026-04-28T08:15:00Z')
  },
  {
    id: 3,
    title: 'Как оформить отпуск через систему?',
    slug: 'kak-oformit-otpusk',
    content: 'Не могу разобраться с системой заявок на отпуск. Кто-нибудь может объяснить пошагово?',
    categoryId: 3,
    author: {
      id: 3,
      fullName: 'Сидоров Петр',
      avatar: null,
      position: 'Middle Developer'
    },
    isPinned: false,
    isLocked: false,
    viewsCount: 234,
    repliesCount: 8,
    likesCount: 12,
    createdAt: new Date('2026-04-25T11:30:00Z'),
    updatedAt: new Date('2026-04-27T16:45:00Z')
  },
  {
    id: 4,
    title: 'Рекомендации по онлайн-курсам для разработчиков',
    slug: 'rekomendacii-po-kursam',
    content: 'Хочу прокачать навыки в React. Какие курсы посоветуете? Может компания компенсирует?',
    categoryId: 4,
    author: {
      id: 4,
      fullName: 'Козлова Анна',
      avatar: null,
      position: 'Junior Frontend'
    },
    isPinned: false,
    isLocked: false,
    viewsCount: 178,
    repliesCount: 19,
    likesCount: 24,
    createdAt: new Date('2026-04-24T09:00:00Z'),
    updatedAt: new Date('2026-04-28T07:20:00Z')
  },
  {
    id: 5,
    title: 'Встреча новичков - кто идет?',
    slug: 'vstrecha-novichkov',
    content: 'В пятницу в 18:00 встреча всех, кто пришел в компанию за последние 3 месяца. Пиццы будет много! Кто идет?',
    categoryId: 2,
    author: {
      id: 5,
      fullName: 'Морозов Алексей',
      avatar: null,
      position: 'HR Manager'
    },
    isPinned: true,
    isLocked: false,
    viewsCount: 312,
    repliesCount: 45,
    likesCount: 67,
    createdAt: new Date('2026-04-23T15:00:00Z'),
    updatedAt: new Date('2026-04-28T10:05:00Z')
  }
];

function ForumHome({ currentUser, onTopicClick }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'popular', 'oldest'
  const [topics, setTopics] = useState(MOCK_TOPICS);

  const filteredTopics = selectedCategory
    ? topics.filter(t => t.categoryId === selectedCategory)
    : topics;

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'latest') {
      return b.updatedAt - a.updatedAt;
    } else if (sortBy === 'popular') {
      return b.likesCount - a.likesCount;
    } else {
      return a.createdAt - b.createdAt;
    }
  });

  // Закрепленные темы всегда сверху
  const pinnedTopics = sortedTopics.filter(t => t.isPinned);
  const regularTopics = sortedTopics.filter(t => !t.isPinned);
  const displayTopics = [...pinnedTopics, ...regularTopics];

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const getCategoryById = (id) => {
    return MOCK_CATEGORIES.find(c => c.id === id);
  };

  return (
    <div className="forum-grid">
      {/* LEFT: Categories */}
      <aside className="rail rail-left">
        <button className="new-topic-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Создать тему
        </button>

        <div className="rail-head">
          <span className="kicker">категории</span>
        </div>

        <ul className="categories-list">
          <li
            className={`category-item ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            <div className="category-icon">🌐</div>
            <div className="category-info">
              <div className="category-name">Все темы</div>
              <div className="category-count">{MOCK_TOPICS.length} тем</div>
            </div>
          </li>
          {MOCK_CATEGORIES.map(category => (
            <li
              key={category.id}
              className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-info">
                <div className="category-name">{category.name}</div>
                <div className="category-count">{category.topicsCount} тем</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* CENTER: Topics list */}
      <section className="forum-main">
        <div className="forum-header">
          <h1 className="forum-title">
            {selectedCategory ? (
              <>
                {getCategoryById(selectedCategory)?.icon} <em>{getCategoryById(selectedCategory)?.name}</em>
              </>
            ) : (
              <>
                Все темы<span className="brand-dot">.</span>
              </>
            )}
          </h1>

          <div className="sort-tabs">
            <button
              className={`sort-tab ${sortBy === 'latest' ? 'active' : ''}`}
              onClick={() => setSortBy('latest')}
            >
              Новые
            </button>
            <button
              className={`sort-tab ${sortBy === 'popular' ? 'active' : ''}`}
              onClick={() => setSortBy('popular')}
            >
              Популярные
            </button>
            <button
              className={`sort-tab ${sortBy === 'oldest' ? 'active' : ''}`}
              onClick={() => setSortBy('oldest')}
            >
              Старые
            </button>
          </div>
        </div>

        <div className="topics-list">
          {displayTopics.map(topic => {
            const category = getCategoryById(topic.categoryId);
            return (
              <div
                key={topic.id}
                className={`topic-card ${topic.isPinned ? 'pinned' : ''}`}
                onClick={() => onTopicClick(topic)}
              >
                <div className="topic-main">
                  <div className="topic-author-avatar">
                    {topic.author.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="topic-content">
                    <div className="topic-header">
                      <span className="topic-category-badge">
                        {category?.icon} {category?.name}
                      </span>
                      {topic.isPinned && (
                        <span className="topic-pinned-badge" title="Закреплено">📌</span>
                      )}
                    </div>
                    <h3 className="topic-title">{topic.title}</h3>
                    <p className="topic-excerpt">{topic.content}</p>
                    <div className="topic-meta">
                      <span className="topic-meta-item">
                        <strong>{topic.author.fullName}</strong>
                      </span>
                      <span className="topic-meta-item">·</span>
                      <span className="topic-meta-item">{formatDate(topic.updatedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="topic-stats">
                  <div className="topic-stat">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
                      <path d="M8 4v4l2 2"/>
                    </svg>
                    {topic.viewsCount}
                  </div>
                  <div className="topic-stat">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 2h12v9H5L2 14V2z"/>
                    </svg>
                    {topic.repliesCount}
                  </div>
                  <div className="topic-stat">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 2l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5l2-5z"/>
                    </svg>
                    {topic.likesCount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RIGHT: Stats & Active users */}
      <aside className="rail rail-right">
        <article className="card">
          <span className="kicker">статистика</span>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">173</div>
              <div className="stat-label">тем</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">892</div>
              <div className="stat-label">ответов</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">45</div>
              <div className="stat-label">участников</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">12</div>
              <div className="stat-label">онлайн</div>
            </div>
          </div>
        </article>

        <article className="card">
          <span className="kicker">сейчас на форуме</span>
          <ul className="active-users-list">
            <li className="active-user-item">
              <div className="active-user-avatar">АП</div>
              <div className="active-user-name">Анна Петрова</div>
              <div className="online-dot"></div>
            </li>
            <li className="active-user-item">
              <div className="active-user-avatar">ИС</div>
              <div className="active-user-name">Иван Сидоров</div>
              <div className="online-dot"></div>
            </li>
            <li className="active-user-item">
              <div className="active-user-avatar">МК</div>
              <div className="active-user-name">Мария Козлова</div>
              <div className="online-dot"></div>
            </li>
            <li className="active-user-item">
              <div className="active-user-avatar">ПМ</div>
              <div className="active-user-name">Петр Морозов</div>
              <div className="online-dot"></div>
            </li>
          </ul>
        </article>

        <article className="card">
          <span className="kicker">о форуме</span>
          <p style={{ fontSize: '13px', color: 'var(--ink-2)', lineHeight: '1.6', margin: 0 }}>
            Это пространство для общения молодых сотрудников. Задавайте вопросы, делитесь опытом, помогайте друг другу.
          </p>
        </article>
      </aside>
    </div>
  );
}

export default ForumHome
