import { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';

function ArticleView({ article, onBack, currentUser }) {
  const [selectedText, setSelectedText] = useState('');
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIInput, setShowAIInput] = useState(false);
  const [showBottomAI, setShowBottomAI] = useState(false);
  const [bottomQuestion, setBottomQuestion] = useState('');
  const [bottomResponse, setBottomResponse] = useState('');
  const [isBottomLoading, setIsBottomLoading] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text && contentRef.current?.contains(selection.anchorNode)) {
        setSelectedText(text);
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowAIPopup(true);
        setShowAIInput(false);
        setAiQuestion('');
        setAiResponse('');
      } else if (!showAIInput) {
        // Только закрываем если не открыт инпут
        setShowAIPopup(false);
        setShowAIInput(false);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [showAIInput]);

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;

    setIsAILoading(true);
    setAiResponse('');

    try {
      const fullQuestion = `Контекст: "${selectedText}"\n\nВопрос: ${aiQuestion}`;
      let fullText = '';

      await chatAPI.sendMessageStream(fullQuestion, currentUser?.employeeId, (data) => {
        if (data.type === 'token' && data.delta) {
          fullText += data.delta;
          setAiResponse(fullText);
        } else if (data.type === 'done') {
          setIsAILoading(false);
        }
      });
    } catch (error) {
      console.error('AI request failed:', error);
      setAiResponse('Произошла ошибка при обращении к AI');
      setIsAILoading(false);
    }
  };

  const handleBottomAskAI = async () => {
    if (!bottomQuestion.trim()) return;

    setIsBottomLoading(true);
    setBottomResponse('');

    try {
      const fullQuestion = `Документ: "${article.title}"\n\nВопрос по документу: ${bottomQuestion}`;
      let fullText = '';

      await chatAPI.sendMessageStream(fullQuestion, currentUser?.employeeId, (data) => {
        if (data.type === 'token' && data.delta) {
          fullText += data.delta;
          setBottomResponse(fullText);
        } else if (data.type === 'done') {
          setIsBottomLoading(false);
        }
      });
    } catch (error) {
      console.error('AI request failed:', error);
      setBottomResponse('Произошла ошибка при обращении к AI');
      setIsBottomLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: '400', margin: '32px 0 16px', color: 'var(--ink)' }}>{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} style={{ fontFamily: "'Fraunces', serif", fontSize: '24px', fontWeight: '400', margin: '24px 0 12px', color: 'var(--ink)' }}>{line.slice(3)}</h2>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} style={{ marginLeft: '20px', marginBottom: '8px', color: 'var(--ink)' }}>{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} style={{ marginBottom: '12px', lineHeight: '1.6', color: 'var(--ink)' }}>{line}</p>;
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--paper)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: '1px solid var(--line)',
            color: 'var(--ink)',
            padding: '8px 16px',
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            transition: '.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--moss)';
            e.target.style.color = 'var(--moss)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--line)';
            e.target.style.color = 'var(--ink)';
          }}
        >
          ← Назад
        </button>
        <div>
          <div style={{
            fontSize: '10px',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: '4px'
          }}>
            {article.category}
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '24px',
            fontWeight: '400',
            color: 'var(--ink)',
            margin: 0
          }}>
            {article.icon} {article.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 48px'
      }}>
        <div ref={contentRef} style={{ maxWidth: '800px', margin: '0 auto', fontSize: '15px' }}>
          {renderMarkdown(article.content)}
        </div>

        {/* Bottom AI Assistant */}
        <div style={{
          maxWidth: '800px',
          margin: '48px auto 0',
          padding: '24px',
          background: 'var(--paper)',
          border: '1px solid var(--line)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
            <h3 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '18px',
              fontWeight: '400',
              color: 'var(--ink)',
              margin: 0
            }}>
              Спросить HR AI по документу
            </h3>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={bottomQuestion}
              onChange={(e) => setBottomQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBottomAskAI()}
              placeholder="Задайте вопрос по этому документу..."
              disabled={isBottomLoading}
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                padding: '12px 16px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                outline: 'none',
                transition: '.2s'
              }}
            />
          </div>

          <button
            onClick={handleBottomAskAI}
            disabled={!bottomQuestion.trim() || isBottomLoading}
            style={{
              background: 'var(--moss)',
              color: 'var(--paper)',
              border: 'none',
              padding: '10px 20px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: (!bottomQuestion.trim() || isBottomLoading) ? 'not-allowed' : 'pointer',
              opacity: (!bottomQuestion.trim() || isBottomLoading) ? 0.5 : 1,
              transition: '.2s'
            }}
          >
            {isBottomLoading ? 'Обработка...' : 'Спросить'}
          </button>

          {bottomResponse && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'var(--ink)',
              whiteSpace: 'pre-wrap'
            }}>
              {bottomResponse}
            </div>
          )}
        </div>
      </div>

      {/* Selection AI Popup */}
      {showAIPopup && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            background: 'var(--paper)',
            border: '1px solid var(--moss)',
            padding: '8px 12px',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {!showAIInput ? (
            <button
              onClick={() => setShowAIInput(true)}
              style={{
                background: 'var(--moss)',
                color: 'var(--paper)',
                border: 'none',
                padding: '6px 12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>🤖</span> Спросить HR AI
            </button>
          ) : (
            <div style={{
              minWidth: '300px',
              maxWidth: '400px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--ink-3)',
                  fontFamily: "'JetBrains Mono', monospace",
                  flex: 1
                }}>
                  Выделено: "{selectedText.slice(0, 30)}{selectedText.length > 30 ? '...' : ''}"
                </div>
                <button
                  onClick={() => {
                    setShowAIPopup(false);
                    setShowAIInput(false);
                    setAiQuestion('');
                    setAiResponse('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ink-2)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0 4px',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </div>

              <input
                id="ai-question-input"
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                placeholder="Ваш вопрос..."
                disabled={isAILoading}
                autoFocus
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  padding: '8px 12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  outline: 'none',
                  marginBottom: '8px'
                }}
              />

              <button
                onClick={handleAskAI}
                disabled={!aiQuestion.trim() || isAILoading}
                style={{
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  border: 'none',
                  padding: '6px 12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  cursor: (!aiQuestion.trim() || isAILoading) ? 'not-allowed' : 'pointer',
                  opacity: (!aiQuestion.trim() || isAILoading) ? 0.5 : 1,
                  width: '100%'
                }}
              >
                {isAILoading ? 'Обработка...' : 'Отправить'}
              </button>

              {aiResponse && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: 'var(--ink)',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {aiResponse}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ArticleView;
