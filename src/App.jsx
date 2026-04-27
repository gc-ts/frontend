import { useState, useRef, useEffect } from 'react'
import './App.css'
import Auth from './Auth.jsx'
import { chatAPI, employeeAPI } from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState(null)
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null)

  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState('light')
  const [editingChatId, setEditingChatId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const [userProfile, setUserProfile] = useState({
    employeeId: '12345',
    email: 'a.potapov@company.ru',
    fullName: 'Потапов Артем Павлович',
    birthDate: '20.05.1990',
    workSchedule: '5/2, 09:00-18:00',
    position: 'Senior Developer',
    department: 'IT',
    vacationDays: 14,
    nextVacation: '01.07.2026 - 14.07.2026',
    salary: {
      advance: '75 000 ₽',
      lastPayment: '150 000 ₽',
      paymentDate: '05.04.2026'
    },
    benefits: {
      dms: 'Полис ДМС №12345678',
      cafeteria: 'Доступ активен, баланс: 15 000 ₽'
    },
    hrContact: {
      name: 'Петрова Анна Сергеевна',
      email: 'petrova.anna@1221systems.ru',
      phone: '+7 (495) 123-45-67'
    }
  })

  // Проверка авторизации при монтировании
  useEffect(() => {
    const token = localStorage.getItem('token');
    const employee = localStorage.getItem('employee');

    if (token && employee) {
      setAuthToken(token);
      setIsAuthenticated(true);
      const employeeData = JSON.parse(employee);
      const empId = employeeData.employee_id;
      setCurrentEmployeeId(empId);

      setUserProfile(prev => ({
        ...prev,
        employeeId: empId,
        email: employeeData.email,
        fullName: employeeData.full_name,
        position: employeeData.position,
        department: employeeData.department,
        vacationDays: employeeData.vacation_days,
        birthDate: employeeData.birth_date ? new Date(employeeData.birth_date).toLocaleDateString('ru-RU') : prev.birthDate
      }));

      // Загрузка чатов для этого пользователя
      loadChatsForUser(empId);
    }
  }, []);

  // Загрузка чатов из localStorage для конкретного пользователя
  const loadChatsForUser = (employeeId) => {
    const storageKey = `chats_${employeeId}`;
    const savedChats = localStorage.getItem(storageKey);

    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      // Восстанавливаем Date объекты
      const chatsWithDates = parsedChats.map(chat => ({
        ...chat,
        date: new Date(chat.date),
        messages: chat.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setChats(chatsWithDates);
      if (chatsWithDates.length > 0) {
        setActiveChat(chatsWithDates[0].id);
      }
    } else {
      // Создаем первый чат для нового пользователя
      const initialChat = {
        id: Date.now(),
        title: 'Новый чат',
        messages: [
          {
            id: Date.now() + 1,
            text: 'Привет! Я ваш AI-ассистент. Чем могу помочь?',
            sender: 'bot',
            timestamp: new Date()
          }
        ],
        date: new Date()
      };
      setChats([initialChat]);
      setActiveChat(initialChat.id);
      saveChatsForUser(employeeId, [initialChat]);
    }
  };

  // Сохранение чатов в localStorage для конкретного пользователя
  const saveChatsForUser = (employeeId, chatsData) => {
    const storageKey = `chats_${employeeId}`;
    localStorage.setItem(storageKey, JSON.stringify(chatsData));
  };

  // Сохранение чатов при каждом изменении
  useEffect(() => {
    if (currentEmployeeId && chats.length > 0) {
      saveChatsForUser(currentEmployeeId, chats);
    }
  }, [chats, currentEmployeeId]);

  const handleLogin = (employee, token) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    const empId = employee.employee_id;
    setCurrentEmployeeId(empId);

    setUserProfile(prev => ({
      ...prev,
      employeeId: empId,
      email: employee.email,
      fullName: employee.full_name,
      position: employee.position,
      department: employee.department,
      vacationDays: employee.vacation_days,
      birthDate: employee.birth_date ? new Date(employee.birth_date).toLocaleDateString('ru-RU') : prev.birthDate
    }));

    // Загрузка чатов для этого пользователя
    loadChatsForUser(empId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    setAuthToken(null);
    setIsAuthenticated(false);
    setCurrentEmployeeId(null);
    setChats([]);
    setActiveChat(null);
  };

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  const currentChat = chats.find(chat => chat.id === activeChat)
  const messages = currentChat?.messages || []

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'Новый чат',
      messages: [
        {
          id: Date.now() + 1,
          text: 'Привет! Я ваш AI-ассистент. Чем могу помочь?',
          sender: 'bot',
          timestamp: new Date()
        }
      ],
      date: new Date()
    }
    setChats(prev => [newChat, ...prev])
    setActiveChat(newChat.id)
    setSidebarOpen(false)
  }

  const formatDate = (date) => {
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Сегодня'
    if (days === 1) return 'Вчера'
    if (days < 7) return `${days} дня назад`
    return date.toLocaleDateString('ru-RU')
  }

  const startEditingTitle = (chatId, currentTitle) => {
    setEditingChatId(chatId)
    setEditingTitle(currentTitle)
  }

  const saveTitle = () => {
    if (editingTitle.trim()) {
      setChats(prev => prev.map(chat =>
        chat.id === editingChatId
          ? { ...chat, title: editingTitle.trim() }
          : chat
      ))
    }
    setEditingChatId(null)
    setEditingTitle('')
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveTitle()
    } else if (e.key === 'Escape') {
      setEditingChatId(null)
      setEditingTitle('')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setChats(prev => prev.map(chat =>
      chat.id === activeChat
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ))

    const messageText = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
      // Отправка сообщения в backend
      const response = await chatAPI.sendMessage(messageText, userProfile.employeeId)

      // Имитация печати - показываем текст постепенно
      const fullText = response.response;
      let currentText = '';
      const botMessageId = Date.now() + 1;

      // Добавляем пустое сообщение бота
      const botMessage = {
        id: botMessageId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
        source: response.source,
        isTyping: true
      };

      setChats(prev => prev.map(chat =>
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, botMessage] }
          : chat
      ));

      // Анимация печати
      const typingSpeed = 20; // миллисекунды на символ
      for (let i = 0; i <= fullText.length; i++) {
        currentText = fullText.slice(0, i);

        setChats(prev => prev.map(chat =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === botMessageId
                    ? { ...msg, text: currentText, isTyping: i < fullText.length }
                    : msg
                )
              }
            : chat
        ));

        if (i < fullText.length) {
          await new Promise(resolve => setTimeout(resolve, typingSpeed));
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error)

      const errorText = 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже или обратитесь в отдел кадров.';
      let currentText = '';
      const errorMessageId = Date.now() + 1;

      // Добавляем пустое сообщение об ошибке
      const errorMessage = {
        id: errorMessageId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
        isTyping: true
      };

      setChats(prev => prev.map(chat =>
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      ));

      // Анимация печати для ошибки
      const typingSpeed = 20;
      for (let i = 0; i <= errorText.length; i++) {
        currentText = errorText.slice(0, i);

        setChats(prev => prev.map(chat =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === errorMessageId
                    ? { ...msg, text: currentText, isTyping: i < errorText.length }
                    : msg
                )
              }
            : chat
        ));

        if (i < errorText.length) {
          await new Promise(resolve => setTimeout(resolve, typingSpeed));
        }
      }
    } finally {
      setIsTyping(false)
    }
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-avatar">
              <span>12</span>
              <span>21</span>
            </div>
          </div>
          <h2>HR AGENT AI</h2>
          <button className="icon-btn theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.5 4.5L14 6M6 14L4.5 15.5M15.5 15.5L14 14M6 6L4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17 10.5C16 14.5 12.5 17 8.5 17C4.5 17 1 13.5 1 9.5C1 5.5 3.5 2 7.5 1C6.5 2 6 3.5 6 5C6 8.5 8.5 11 12 11C13.5 11 15 10.5 16 9.5C16.5 9.8 17 10.1 17 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        <button className="new-chat-btn" onClick={createNewChat}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Создать чат</span>
        </button>

        <div className="conversations">
          <div className="conversations-label">История</div>
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`conversation-item ${chat.id === activeChat ? 'active' : ''}`}
              onClick={() => {
                setActiveChat(chat.id)
                setSidebarOpen(false)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2H14V11H5L2 14V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <div className="conversation-info">
                <div className="conversation-title">{chat.title}</div>
                <div className="conversation-date">{formatDate(chat.date)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="hr-call-btn"
            onClick={(e) => {
              e.stopPropagation()
              window.open('https://meet.google.com', '_blank')
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 8L17 6V14L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Созвон с HR</span>
          </button>

          <div
            className="user-profile"
            onClick={(e) => {
              e.stopPropagation()
              setShowProfile(true)
            }}
          >
            <div className="avatar">
              {userProfile.fullName ? userProfile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'АП'}
            </div>
            <div className="user-info">
              <div className="user-name">
                {userProfile.fullName ? (
                  userProfile.fullName.split(' ').length > 1
                    ? `${userProfile.fullName.split(' ')[0]} ${userProfile.fullName.split(' ')[1][0]}.`
                    : userProfile.fullName
                ) : 'Пользователь'}
              </div>
              <div className="user-status">Онлайн</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="header-left">
            {currentChat && editingChatId === activeChat ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="header-title-input"
              />
            ) : (
              <h1 onClick={() => currentChat && startEditingTitle(activeChat, currentChat.title)}>
                {currentChat ? currentChat.title : 'HR AGENT AI'}
              </h1>
            )}
          </div>

          {currentChat && (
            <div className="chat-title-center">
              {editingChatId === activeChat ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="chat-title-input"
                />
              ) : (
                <button
                  className="chat-title-btn"
                  onClick={() => startEditingTitle(activeChat, currentChat.title)}
                >
                  {currentChat.title}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10 2L12 4L5 11H3V9L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="header-actions">
            <button className="icon-btn new-chat-header-btn" onClick={createNewChat}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                <path d="M12 8v8"/>
                <path d="M8 12h8"/>
              </svg>
            </button>
          </div>
        </header>

        <div className="messages-container">
          <div className="messages">
            {messages.map(message => (
              <div key={message.id} className={`message-wrapper ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === 'bot' ? (
                    <div className="bot-avatar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8V4H8"/>
                        <rect width="16" height="12" x="4" y="8" rx="2"/>
                        <path d="M2 14h2"/>
                        <path d="M20 14h2"/>
                        <path d="M15 13v2"/>
                        <path d="M9 13v2"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="user-avatar">
                      {userProfile.fullName ? userProfile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
                    </div>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {message.text}
                    {message.isTyping && (
                      <span className="typing-cursor">|</span>
                    )}
                    {message.source && !message.isTyping && (
                      <div className="message-source">
                        <small>📄 Источник: {message.source}</small>
                      </div>
                    )}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message-avatar">
                  <div className="bot-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8V4H8"/>
                      <rect width="16" height="12" x="4" y="8" rx="2"/>
                      <path d="M2 14h2"/>
                      <path d="M20 14h2"/>
                      <path d="M15 13v2"/>
                      <path d="M9 13v2"/>
                    </svg>
                  </div>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="input-area">
          <form className="input-container" onSubmit={handleSend}>
            <button type="button" className="attach-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Напишите сообщение..."
              className="message-input"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!inputValue.trim() || isTyping}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
          <div className="input-hint">
            Точную информацию уточняйте у HR
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Профиль сотрудника</h2>
              <button className="modal-close" onClick={() => setShowProfile(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="profile-content">
              <div className="profile-section">
                <h3>Идентификация</h3>
                <div className="profile-field">
                  <span className="field-label">Табельный номер:</span>
                  <span className="field-value">{userProfile.employeeId}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Корпоративная почта:</span>
                  <span className="field-value">{userProfile.email}</span>
                </div>
              </div>

              <div className="profile-section">
                <h3>Личные данные</h3>
                <div className="profile-field">
                  <span className="field-label">ФИО:</span>
                  <span className="field-value">{userProfile.fullName}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">День рождения:</span>
                  <span className="field-value">{userProfile.birthDate}</span>
                </div>
              </div>

              <div className="profile-section">
                <h3>Рабочие данные</h3>
                <div className="profile-field">
                  <span className="field-label">График работы:</span>
                  <span className="field-value">{userProfile.workSchedule}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Должность:</span>
                  <span className="field-value">{userProfile.position}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Подразделение:</span>
                  <span className="field-value">{userProfile.department}</span>
                </div>
              </div>

              <div className="profile-section">
                <h3>Отпуска</h3>
                <div className="profile-field">
                  <span className="field-label">Остаток дней:</span>
                  <span className="field-value">{userProfile.vacationDays} дней</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Ближайший отпуск:</span>
                  <span className="field-value">{userProfile.nextVacation}</span>
                </div>
              </div>

              <div className="profile-section">
                <h3>Зарплата</h3>
                <div className="profile-field">
                  <span className="field-label">Аванс:</span>
                  <span className="field-value">{userProfile.salary.advance}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Последняя выплата:</span>
                  <span className="field-value">{userProfile.salary.lastPayment}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Дата выплаты:</span>
                  <span className="field-value">{userProfile.salary.paymentDate}</span>
                </div>
              </div>

              <div className="profile-section">
                <h3>Льготы и бонусы</h3>
                <div className="profile-field">
                  <span className="field-label">ДМС:</span>
                  <span className="field-value">{userProfile.benefits.dms}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Кафетерий льгот:</span>
                  <span className="field-value">{userProfile.benefits.cafeteria}</span>
                </div>
              </div>

              <div className="profile-section">
                <h3>Контакты</h3>
                <div className="profile-field">
                  <span className="field-label">HR-специалист:</span>
                  <span className="field-value">{userProfile.hrContact.name}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Email:</span>
                  <span className="field-value">{userProfile.hrContact.email}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Телефон:</span>
                  <span className="field-value">{userProfile.hrContact.phone}</span>
                </div>
              </div>

              <button className="logout-btn" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
