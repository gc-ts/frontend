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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('chat') // 'chat', 'forum', 'topic'
  const [selectedTopic, setSelectedTopic] = useState(null)

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
    }

    const savedTheme = localStorage.getItem('forum.theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleLogin = (employee, token) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    setCurrentUser({
      id: employee.id,
      employeeId: employee.employee_id,
      email: employee.email,
      fullName: employee.full_name,
      position: employee.position,
      department: employee.department,
      avatar: null
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    setAuthToken(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('chat');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('forum.theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const openForum = () => {
    setCurrentView('forum');
    setSidebarOpen(false);
  };

  const openTopic = (topic) => {
    setSelectedTopic(topic);
    setCurrentView('topic');
    setSidebarOpen(false);
  };

  const goToChat = () => {
    setCurrentView('chat');
    setSidebarOpen(false);
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

          <button className="ghost-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Меню">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
            </svg>
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
        {/* Sidebar with forum */}
        <aside className={`forum-sidebar ${sidebarOpen ? 'open' : ''}`} style={{
          width: sidebarOpen ? '320px' : '0',
          minWidth: sidebarOpen ? '320px' : '0',
          borderRight: sidebarOpen ? '1px solid var(--line)' : 'none',
          background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--bg-2) 30%, transparent))',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all .3s',
          padding: sidebarOpen ? '28px 24px' : '0'
        }}>
          {sidebarOpen && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={goToChat}
                  style={{
                    width: '100%',
                    background: currentView === 'chat' ? 'var(--ink)' : 'transparent',
                    color: currentView === 'chat' ? 'var(--bg)' : 'var(--ink)',
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
                    background: currentView === 'forum' ? 'var(--ink)' : 'transparent',
                    color: currentView === 'forum' ? 'var(--bg)' : 'var(--ink)',
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

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 1,
              display: window.innerWidth < 768 ? 'block' : 'none'
            }}
          ></div>
        )}

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          {currentView === 'chat' && (
            <ChatMain currentUser={currentUser} />
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

      <style>{`
        .forum-sidebar {
          position: relative;
          z-index: 2;
        }
        @media (max-width: 768px) {
          .forum-sidebar {
            position: fixed;
            left: 0;
            top: 61px;
            height: calc(100vh - 61px);
            z-index: 10;
            background: var(--bg) !important;
          }
        }
      `}</style>
    </div>
  )
}

export default App
