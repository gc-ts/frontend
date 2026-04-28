import { useState, useEffect } from 'react'
import './styles/forum.css'
import Auth from './Auth.jsx'
import ChatMain from './components/ChatMain.jsx'
import TopicView from './components/TopicView.jsx'

// Моковые категории и темы для бокового меню
const FORUM_CATEGORIES = [
  { id: 1, name: 'Адаптация', icon: '🌱', count: 45 },
  { id: 2, name: 'Общение', icon: '💬', count: 128 },
  { id: 3, name: 'Вопросы HR', icon: '📋', count: 67 },
  { id: 4, name: 'Обучение', icon: '📚', count: 89 },
  { id: 5, name: 'Офис', icon: '🏢', count: 34 }
];

const RECENT_TOPICS = [
  { id: 1, title: 'Как проходит первый день?', replies: 12, category: 'Адаптация' },
  { id: 2, title: 'Где обедать рядом с офисом?', replies: 23, category: 'Офис' },
  { id: 3, title: 'Как оформить отпуск?', replies: 8, category: 'Вопросы HR' },
  { id: 4, title: 'Курсы по React', replies: 19, category: 'Обучение' },
  { id: 5, title: 'Встреча новичков', replies: 45, category: 'Общение' }
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [theme, setTheme] = useState('light')
  const [currentView, setCurrentView] = useState('chat') // 'chat', 'forum', 'topic'
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [showChatsList, setShowChatsList] = useState(true) // Показывать список чатов
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token');
    const employee = localStorage.getItem('employee');

    if (token && employee) {
      setAuthToken(token);
      setIsAuthenticated(true);
      const employeeData = JSON.parse(employee);
      setCurrentUser({
        id: employeeData.id,
        employeeId: employeeData.employee_id,
        email: employeeData.email,
        fullName: employeeData.full_name,
        position: employeeData.position,
        department: employeeData.department,
        avatar: null
      });

      // Загрузка чатов пользователя
      loadChats(employeeData.employee_id);
    }

    const savedTheme = localStorage.getItem('forum.theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const loadChats = (employeeId) => {
    const storageKey = `chats_${employeeId}`;
    const savedChats = localStorage.getItem(storageKey);

    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      if (parsedChats.length > 0) {
        setActiveChat(parsedChats[0].id);
      }
    } else {
      // Создаем первый чат
      const initialChat = {
        id: Date.now(),
        title: 'Новый чат',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setChats([initialChat]);
      setActiveChat(initialChat.id);
      localStorage.setItem(storageKey, JSON.stringify([initialChat]));
    }
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'Новый чат',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const storageKey = `chats_${currentUser.employeeId}`;
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setActiveChat(newChat.id);
    localStorage.setItem(storageKey, JSON.stringify(updatedChats));
    setCurrentView('chat');
  };

  const handleChatChange = () => {
    // Перезагрузка чатов после изменения
    loadChats(currentUser.employeeId);
  };

  const formatChatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const handleLogin = (employee, token) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    const empId = employee.employee_id;
    setCurrentUser({
      id: employee.id,
      employeeId: empId,
      email: employee.email,
      fullName: employee.full_name,
      position: employee.position,
      department: employee.department,
      avatar: null
    });
    loadChats(empId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    setAuthToken(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('chat');
    setChats([]);
    setActiveChat(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('forum.theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const openForum = () => {
    setCurrentView('forum');
    setShowChatsList(false);
  };

  const openTopic = (topic) => {
    setSelectedTopic(topic);
    setCurrentView('topic');
    setShowChatsList(false);
  };

  const goToChat = () => {
    setCurrentView('chat');
    setShowChatsList(true);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <div className="noise" aria-hidden="true"></div>

      {/* Top bar */}
      <header className="topbar">
        <div className="brand" onClick={goToChat} style={{ cursor: 'pointer' }}>
          <svg className="logo" viewBox="0 0 32 32" fill="none">
            <path d="M16 30C16 30 4 26 4 14C4 8 9 4 16 4C23 4 28 8 28 14C28 26 16 30 16 30Z" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M16 30V12M16 12C16 12 12 14 10 18M16 12C16 12 20 14 22 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="brand-name">Техна<span className="brand-dot">.</span></span>
          <span className="brand-sub">AI-ассистент + форум</span>
        </div>

        <div className="topbar-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Поиск..." />
        </div>

        <div className="topbar-actions">
          <button
            className="ghost-btn"
            onClick={() => setShowChatsList(!showChatsList)}
            title={showChatsList ? "Скрыть чаты" : "Показать чаты"}
            style={{
              background: showChatsList ? 'var(--moss)' : 'transparent',
              color: showChatsList ? 'var(--paper)' : 'var(--ink-2)'
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>

          <button className="ghost-btn" onClick={toggleTheme} title="Сменить тему">
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <button className="user-menu-btn" onClick={handleLogout} title="Профиль">
            <div className="avatar">
              {currentUser?.fullName ? currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
            </div>
            <span className="name">
              {currentUser?.fullName ? (
                currentUser.fullName.split(' ').length > 1
                  ? `${currentUser.fullName.split(' ')[0]} ${currentUser.fullName.split(' ')[1][0]}.`
                  : currentUser.fullName
              ) : 'Пользователь'}
            </span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: 'flex', height: 'calc(100vh - 61px)', position: 'relative', zIndex: 2 }}>
        {/* Sidebar */}
        <aside style={{
          width: '320px',
          minWidth: '320px',
          borderRight: '1px solid var(--line)',
          background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--bg-2) 30%, transparent))',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '28px 24px'
        }}>
          {/* Tabs */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={goToChat}
              style={{
                width: '100%',
                background: currentView === 'chat' && showChatsList ? 'var(--ink)' : 'transparent',
                color: currentView === 'chat' && showChatsList ? 'var(--bg)' : 'var(--ink)',
                border: '1px solid var(--line)',
                padding: '12px 16px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: '.2s',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
            >
              <span>🤖</span> AI-Чат
            </button>
            <button
              onClick={openForum}
              style={{
                width: '100%',
                background: currentView === 'forum' || currentView === 'topic' ? 'var(--ink)' : 'transparent',
                color: currentView === 'forum' || currentView === 'topic' ? 'var(--bg)' : 'var(--ink)',
                border: '1px solid var(--line)',
                padding: '12px 16px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: '.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
            >
              <span>💬</span> Форум
            </button>
          </div>

          {/* Chats list */}
          {showChatsList && currentView === 'chat' && (
            <>
              <button
                onClick={createNewChat}
                style={{
                  width: '100%',
                  background: 'var(--pistachio)',
                  color: 'var(--pistachio-ink)',
                  border: 'none',
                  padding: '12px 16px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: '.2s',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--moss)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--pistachio)'}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 2v10M2 7h10"/>
                </svg>
                Новый чат
              </button>

              <span className="kicker" style={{ display: 'block', marginBottom: '12px' }}>Ваши чаты</span>
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat.id);
                    setCurrentView('chat');
                  }}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderLeft: `2px solid ${activeChat === chat.id ? 'var(--pistachio)' : 'transparent'}`,
                    background: activeChat === chat.id ? 'var(--paper)' : 'transparent',
                    transition: '.2s',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (activeChat !== chat.id) {
                      e.currentTarget.style.background = 'var(--paper)';
                      e.currentTarget.style.borderLeftColor = 'var(--moss)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeChat !== chat.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderLeftColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', marginBottom: '4px' }}>
                    {chat.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatChatDate(chat.updatedAt)} · {chat.messages.length} сообщ.
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Forum categories */}
          {(currentView === 'forum' || currentView === 'topic') && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <span className="kicker" style={{ display: 'block', marginBottom: '12px' }}>Категории</span>
                {FORUM_CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    onClick={openForum}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderLeft: '2px solid transparent',
                      transition: '.2s',
                      marginBottom: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--paper)';
                      e.currentTarget.style.borderLeftColor = 'var(--moss)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderLeftColor = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                        {cat.count} тем
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <span className="kicker" style={{ display: 'block', marginBottom: '12px' }}>Последние темы</span>
                {RECENT_TOPICS.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => openTopic(topic)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderLeft: '2px solid transparent',
                      transition: '.2s',
                      marginBottom: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--paper)';
                      e.currentTarget.style.borderLeftColor = 'var(--moss)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderLeftColor = 'transparent';
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', marginBottom: '4px' }}>
                      {topic.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {topic.category} · 💬 {topic.replies}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          {currentView === 'chat' && (
            <ChatMain
              currentUser={currentUser}
              activeChat={activeChat}
              onChatChange={handleChatChange}
            />
          )}
          {currentView === 'forum' && (
            <div style={{ padding: '48px', overflowY: 'auto', height: '100%' }}>
              <h1 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '42px',
                fontWeight: '300',
                letterSpacing: '-0.025em',
                color: 'var(--ink)',
                margin: '0 0 32px'
              }}>
                Форум<span style={{ color: 'var(--pistachio)' }}>.</span>
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--ink-2)', marginBottom: '32px' }}>
                Здесь будет полный список тем форума. Пока используйте боковое меню для навигации.
              </p>
            </div>
          )}
          {currentView === 'topic' && selectedTopic && (
            <TopicView
              topic={selectedTopic}
              currentUser={currentUser}
              onBack={goToChat}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
