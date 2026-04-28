import { useState, useEffect } from 'react'
import './styles/forum.css'
import Auth from './Auth.jsx'
import ForumHome from './components/ForumHome.jsx'
import TopicView from './components/TopicView.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [theme, setTheme] = useState('light')
  const [currentView, setCurrentView] = useState('home') // 'home', 'topic', 'new-topic'
  const [selectedTopic, setSelectedTopic] = useState(null)

  // Проверка авторизации при монтировании
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

    // Загрузка темы
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
    setCurrentView('home');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('forum.theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const openTopic = (topic) => {
    setSelectedTopic(topic);
    setCurrentView('topic');
  };

  const goHome = () => {
    setCurrentView('home');
    setSelectedTopic(null);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Ambient grain & noise overlay */}
      <div className="noise" aria-hidden="true"></div>

      {/* Top status bar */}
      <header className="topbar">
        <div className="brand" onClick={goHome} style={{ cursor: 'pointer' }}>
          <svg className="logo" viewBox="0 0 32 32" fill="none">
            <path d="M16 30C16 30 4 26 4 14C4 8 9 4 16 4C23 4 28 8 28 14C28 26 16 30 16 30Z" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M16 30V12M16 12C16 12 12 14 10 18M16 12C16 12 20 14 22 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="brand-name">Forum<span className="brand-dot">.</span></span>
          <span className="brand-sub">терминал общения</span>
        </div>

        <div className="topbar-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Поиск по форуму..." />
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

          <button className="ghost-btn" title="Уведомления">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="notification-badge">3</span>
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

      {/* Main content */}
      {currentView === 'home' && (
        <ForumHome
          currentUser={currentUser}
          onTopicClick={openTopic}
        />
      )}

      {currentView === 'topic' && selectedTopic && (
        <TopicView
          topic={selectedTopic}
          currentUser={currentUser}
          onBack={goHome}
        />
      )}
    </div>
  )
}

export default App
