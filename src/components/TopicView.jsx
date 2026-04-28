import { useState, useEffect } from 'react'

// Моковые ответы для демонстрации
const MOCK_REPLIES = [
  {
    id: 1,
    content: 'Отличный вопрос! У меня первый день прошел очень спокойно. На ресепшене встретили, провели экскурсию по офису, показали рабочее место. Ноутбук уже был настроен и ждал на столе. С собой нужен только паспорт для оформления пропуска.',
    topicId: 1,
    author: {
      id: 2,
      fullName: 'Петрова Мария',
      avatar: null,
      position: 'Designer'
    },
    likesCount: 5,
    isLikedByUser: false,
    createdAt: new Date('2026-04-27T11:00:00Z'),
    updatedAt: new Date('2026-04-27T11:00:00Z')
  },
  {
    id: 2,
    content: 'Добавлю от себя - не забудь взять наушники! В опен-спейсе бывает шумно. И да, в первый день обычно знакомят с командой и проводят вводный инструктаж по безопасности.',
    topicId: 1,
    author: {
      id: 3,
      fullName: 'Сидоров Петр',
      avatar: null,
      position: 'Middle Developer'
    },
    likesCount: 3,
    isLikedByUser: false,
    createdAt: new Date('2026-04-27T12:30:00Z'),
    updatedAt: new Date('2026-04-27T12:30:00Z')
  },
  {
    id: 3,
    content: 'У меня в первый день был welcome-lunch с командой. Очень помогло познакомиться и расслабиться. Не переживай, все будет хорошо! 🌱',
    topicId: 1,
    author: {
      id: 4,
      fullName: 'Козлова Анна',
      avatar: null,
      position: 'Junior Frontend'
    },
    likesCount: 8,
    isLikedByUser: true,
    createdAt: new Date('2026-04-27T14:15:00Z'),
    updatedAt: new Date('2026-04-27T14:15:00Z')
  }
];

function TopicView({ topic, currentUser, onBack }) {
  const [replies, setReplies] = useState(MOCK_REPLIES.filter(r => r.topicId === topic.id));
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(topic.likesCount);

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
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleReplyLike = (replyId) => {
    setReplies(replies.map(reply => {
      if (reply.id === replyId) {
        return {
          ...reply,
          isLikedByUser: !reply.isLikedByUser,
          likesCount: reply.isLikedByUser ? reply.likesCount - 1 : reply.likesCount + 1
        };
      }
      return reply;
    }));
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      content: replyText,
      topicId: topic.id,
      author: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        avatar: currentUser.avatar,
        position: currentUser.position
      },
      likesCount: 0,
      isLikedByUser: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setReplies([...replies, newReply]);
    setReplyText('');
  };

  return (
    <div className="forum-grid">
      {/* LEFT: Back navigation */}
      <aside className="rail rail-left">
        <button
          className="new-topic-btn"
          onClick={onBack}
          style={{ background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад к темам
        </button>

        <div className="rail-head" style={{ marginTop: '24px' }}>
          <span className="kicker">автор темы</span>
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: '18px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '0',
              background: 'var(--moss)',
              color: 'var(--paper)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: "'Fraunces', serif",
              fontWeight: '500',
              fontSize: '16px'
            }}>
              {topic.author.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>
                {topic.author.fullName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                {topic.author.position}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
            Создано {formatDate(topic.createdAt)}
          </div>
        </div>
      </aside>

      {/* CENTER: Topic content */}
      <section className="forum-main">
        <div className="topic-view">
          <div className="topic-view-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="topic-category-badge">
                🌱 Адаптация
              </span>
              {topic.isPinned && (
                <span style={{ fontSize: '14px' }} title="Закреплено">📌</span>
              )}
            </div>
            <h1 className="topic-view-title">{topic.title}</h1>
            <div className="topic-view-meta">
              <div className="topic-view-author">
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '999px',
                  background: 'var(--moss)',
                  color: 'var(--paper)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {topic.author.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--ink)' }}>
                    {topic.author.fullName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatDate(topic.createdAt)}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                <span>👁 {topic.viewsCount}</span>
                <span>💬 {replies.length}</span>
                <span>⭐ {likesCount}</span>
              </div>
            </div>
          </div>

          <div className="topic-view-content">
            <p>{topic.content}</p>
          </div>

          <div className="topic-actions">
            <button className={`action-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5l2-5z"/>
              </svg>
              {isLiked ? 'Нравится' : 'Оценить'} ({likesCount})
            </button>
            <button className="action-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v12M2 8h12"/>
              </svg>
              Поделиться
            </button>
          </div>

          {/* Replies */}
          <div className="replies-section">
            <div className="replies-header">
              Ответы ({replies.length})
            </div>

            {replies.map(reply => (
              <div key={reply.id} className="reply-card">
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '0',
                  background: 'var(--moss)',
                  color: 'var(--paper)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: "'Fraunces', serif",
                  fontWeight: '500',
                  fontSize: '16px'
                }}>
                  {reply.author.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>
                      {reply.author.fullName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {reply.author.position}
                    </div>
                  </div>
                  <div className="reply-content">
                    {reply.content}
                  </div>
                  <div className="reply-meta">
                    <span>{formatDate(reply.createdAt)}</span>
                    <span>·</span>
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: reply.isLikedByUser ? 'var(--hot)' : 'var(--ink-3)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: 0
                      }}
                      onClick={() => handleReplyLike(reply.id)}
                    >
                      ⭐ {reply.likesCount}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply form */}
          <form className="reply-form" onSubmit={handleSubmitReply}>
            <div style={{ marginBottom: '12px' }}>
              <span className="kicker">Ваш ответ</span>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Напишите ваш ответ..."
            />
            <div className="reply-form-actions">
              <button type="button" className="btn-secondary" onClick={() => setReplyText('')}>
                Отмена
              </button>
              <button type="submit" className="btn-primary" disabled={!replyText.trim()}>
                Отправить
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* RIGHT: Related topics */}
      <aside className="rail rail-right">
        <article className="card">
          <span className="kicker">похожие темы</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div style={{ cursor: 'pointer', paddingBottom: '12px', borderBottom: '1px dashed var(--line)' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', marginBottom: '4px' }}>
                Что нужно знать в первую неделю?
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                💬 15 · ⭐ 23
              </div>
            </div>
            <div style={{ cursor: 'pointer', paddingBottom: '12px', borderBottom: '1px dashed var(--line)' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', marginBottom: '4px' }}>
                Как быстро влиться в команду?
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                💬 28 · ⭐ 34
              </div>
            </div>
            <div style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ink)', marginBottom: '4px' }}>
                Чек-лист для новичка
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                💬 42 · ⭐ 67
              </div>
            </div>
          </div>
        </article>

        <article className="card">
          <span className="kicker">правила форума</span>
          <ul style={{ margin: '12px 0 0', padding: '0 0 0 18px', fontSize: '12px', color: 'var(--ink-2)', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '6px' }}>Будьте вежливы и уважительны</li>
            <li style={{ marginBottom: '6px' }}>Не публикуйте личную информацию</li>
            <li style={{ marginBottom: '6px' }}>Используйте поиск перед созданием темы</li>
            <li>Помогайте новичкам</li>
          </ul>
        </article>
      </aside>
    </div>
  );
}

export default TopicView
