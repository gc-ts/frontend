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
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          width: '90%',
          maxWidth: '480px',
          padding: '32px',
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
          marginBottom: '32px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '999px',
            background: 'var(--sage)',
            color: 'var(--paper)',
            display: 'grid',
            placeItems: 'center',
            fontFamily: "'Fraunces', serif",
            fontWeight: '500',
            fontSize: '28px',
            marginBottom: '16px'
          }}>
            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
          </div>

          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '24px',
            fontWeight: '400',
            color: 'var(--ink)',
            margin: '0 0 4px'
          }}>
            {user?.fullName || 'Пользователь'}
          </h2>

          <div style={{
            fontSize: '12px',
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
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            padding: '16px',
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
              fontFamily: "'Inter', sans-serif"
            }}>
              {user?.email || '—'}
            </div>
          </div>

          <div style={{
            padding: '16px',
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
            padding: '16px',
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
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            background: 'var(--ink)',
            color: 'var(--bg)',
            border: 'none',
            padding: '14px 24px',
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
