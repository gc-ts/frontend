function ProfileModal({ user, onClose, onLogout }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-2)',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px 8px',
            transition: '.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--ink)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--ink-2)'}
        >
          ×
        </button>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '999px',
            background: 'var(--sage)',
            color: 'var(--paper)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: "'Fraunces', serif",
            fontWeight: '500',
            fontSize: '24px',
            marginBottom: '12px'
          }}>
            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
          </div>

          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '20px',
            fontWeight: '400',
            color: 'var(--ink)',
            margin: '0 0 4px',
            textAlign: 'center'
          }}>
            {user?.fullName || 'Пользователь'}
          </h2>

          <div style={{
            fontSize: '11px',
            color: 'var(--ink-3)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '.05em'
          }}>
            ID: {user?.employeeId}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '12px',
            background: 'var(--bg)',
            border: '1px solid var(--line)'
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: '6px'
            }}>
              Табельный номер
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--ink)',
              fontFamily: "'Inter', sans-serif"
            }}>
              {user?.employeeId || '—'}
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'var(--bg)',
            border: '1px solid var(--line)'
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: '6px'
            }}>
              Email
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--ink)',
              fontFamily: "'Inter', sans-serif",
              wordBreak: 'break-word'
            }}>
              {user?.email || '—'}
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'var(--bg)',
            border: '1px solid var(--line)'
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: '6px'
            }}>
              Должность
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--ink)',
              fontFamily: "'Inter', sans-serif"
            }}>
              {user?.position || '—'}
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'var(--bg)',
            border: '1px solid var(--line)'
          }}>
            <div style={{
              fontSize: '10px',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: '6px'
            }}>
              Отдел
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--ink)',
              fontFamily: "'Inter', sans-serif"
            }}>
              {user?.department || '—'}
            </div>
          </div>

          {user?.phone && (
            <div style={{
              padding: '12px',
              background: 'var(--bg)',
              border: '1px solid var(--line)'
            }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: '6px'
              }}>
                Телефон
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--ink)',
                fontFamily: "'Inter', sans-serif"
              }}>
                {user.phone}
              </div>
            </div>
          )}

          {user?.birthDate && (
            <div style={{
              padding: '12px',
              background: 'var(--bg)',
              border: '1px solid var(--line)'
            }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: '6px'
              }}>
                Дата рождения
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--ink)',
                fontFamily: "'Inter', sans-serif"
              }}>
                {new Date(user.birthDate).toLocaleDateString('ru-RU')}
              </div>
            </div>
          )}

          {user?.hireDate && (
            <div style={{
              padding: '12px',
              background: 'var(--bg)',
              border: '1px solid var(--line)'
            }}>
              <div style={{
                fontSize: '10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: '6px'
              }}>
                Дата приема на работу
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--ink)',
                fontFamily: "'Inter', sans-serif"
              }}>
                {new Date(user.hireDate).toLocaleDateString('ru-RU')}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            background: 'var(--ink)',
            color: 'var(--bg)',
            border: 'none',
            padding: '12px 20px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: '.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--moss)'}
          onMouseLeave={(e) => e.target.style.background = 'var(--ink)'}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}

export default ProfileModal;
