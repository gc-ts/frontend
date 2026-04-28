import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'

function ChatMain({ currentUser }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Привет! Я — AI-ассистент «Техна». Задавайте вопросы по HR-процессам, отпускам, документам компании.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage(messageText, currentUser?.employeeId);
      setIsTyping(false);

      const fullText = response.response;
      let currentText = '';
      const botMessageId = Date.now() + 1;

      const botMessage = {
        id: botMessageId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
        source: response.source,
        isTyping: true
      };

      setMessages(prev => [...prev, botMessage]);

      const typingSpeed = 20;
      for (let i = 0; i <= fullText.length; i++) {
        currentText = fullText.slice(0, i);

        setMessages(prev => prev.map(msg =>
          msg.id === botMessageId
            ? { ...msg, text: currentText, isTyping: i < fullText.length }
            : msg
        ));

        if (i < fullText.length) {
          await new Promise(resolve => setTimeout(resolve, typingSpeed));
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);

      const errorText = 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.';
      const errorMessageId = Date.now() + 1;

      setMessages(prev => [...prev, {
        id: errorMessageId,
        text: errorText,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const quickQuestions = [
    'Сколько у меня дней отпуска?',
    'Когда выплачивается аванс?',
    'Как оформить больничный?',
    'График работы в праздники'
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg)'
    }}>
      {/* Chat header */}
      <div style={{
        padding: '24px 32px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--paper)'
      }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '28px',
          fontWeight: '400',
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: '0 0 8px'
        }}>
          AI-ассистент <em style={{ color: 'var(--moss)' }}>«Техна»</em>
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--ink-2)',
          margin: 0
        }}>
          Отвечаю на вопросы по HR-процессам на основе документов компании
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {messages.map(message => (
          <div key={message.id} style={{
            display: 'grid',
            gridTemplateColumns: '44px 1fr',
            gap: '16px',
            alignItems: 'start'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: message.sender === 'bot' ? '0' : '999px',
              background: message.sender === 'bot' ? 'var(--moss)' : 'var(--sage)',
              color: 'var(--paper)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: "'Fraunces', serif",
              fontWeight: '500',
              fontSize: '16px'
            }}>
              {message.sender === 'bot' ? '🤖' : (currentUser?.fullName ? currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U')}
            </div>
            <div>
              <div style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                padding: '16px 20px',
                fontSize: '15px',
                lineHeight: '1.6',
                color: 'var(--ink)',
                whiteSpace: 'pre-wrap'
              }}>
                {message.text}
                {message.isTyping && (
                  <span style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1em',
                    background: 'var(--ink)',
                    marginLeft: '2px',
                    animation: 'blink 1s infinite'
                  }}>|</span>
                )}
                {message.source && !message.isTyping && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px dashed var(--line)',
                    fontSize: '12px',
                    color: 'var(--ink-3)',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    📄 Источник: {message.source}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--ink-3)',
                marginTop: '6px',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '44px 1fr',
            gap: '16px',
            alignItems: 'start'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '0',
              background: 'var(--moss)',
              color: 'var(--paper)',
              display: 'grid',
              placeItems: 'center',
              fontSize: '16px'
            }}>
              🤖
            </div>
            <div style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              padding: '16px 20px'
            }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  background: 'var(--moss)',
                  animation: 'pulse 1.4s ease-in-out infinite'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  background: 'var(--moss)',
                  animation: 'pulse 1.4s ease-in-out 0.2s infinite'
                }}></span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  background: 'var(--moss)',
                  animation: 'pulse 1.4s ease-in-out 0.4s infinite'
                }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      {messages.length === 1 && (
        <div style={{
          padding: '0 32px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            width: '100%',
            marginBottom: '4px'
          }}>
            Популярные вопросы
          </span>
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setInputValue(q)}
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                color: 'var(--ink-2)',
                padding: '8px 14px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: '.2s',
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--moss)';
                e.target.style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--line)';
                e.target.style.color = 'var(--ink-2)';
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} style={{
        padding: '24px 32px',
        borderTop: '1px solid var(--line)',
        background: 'var(--paper)'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Напишите ваш вопрос..."
            disabled={isTyping}
            style={{
              flex: 1,
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              padding: '14px 16px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              outline: 'none',
              transition: '.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--moss)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            style={{
              background: 'var(--ink)',
              color: 'var(--bg)',
              border: 'none',
              padding: '14px 24px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: (!inputValue.trim() || isTyping) ? 'not-allowed' : 'pointer',
              transition: '.2s',
              opacity: (!inputValue.trim() || isTyping) ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (inputValue.trim() && !isTyping) {
                e.target.style.background = 'var(--moss)';
              }
            }}
            onMouseLeave={(e) => {
              if (inputValue.trim() && !isTyping) {
                e.target.style.background = 'var(--ink)';
              }
            }}
          >
            Отправить
          </button>
        </div>
        <div style={{
          marginTop: '12px',
          fontSize: '11px',
          color: 'var(--ink-3)',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          Ответы основаны на документах компании. Точную информацию уточняйте у HR.
        </div>
      </form>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default ChatMain
