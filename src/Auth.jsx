import { useState } from 'react';
import { authAPI } from './services/api';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    employeeId: '',
    email: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.login(formData.login, formData.password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('employee', JSON.stringify(data.employee));
      onLogin(data.employee, data.token);
    } catch (err) {
      setError('Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.register(
        formData.employeeId,
        formData.email,
        formData.password,
        formData.fullName
      );

      // Автоматический вход после регистрации
      if (data.token && data.employee) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('employee', JSON.stringify(data.employee));
        onLogin(data.employee, data.token);
      } else {
        // Если токен не вернулся, делаем автоматический логин
        const loginData = await authAPI.login(formData.employeeId, formData.password);
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('employee', JSON.stringify(loginData.employee));
        onLogin(loginData.employee, loginData.token);
      }
    } catch (err) {
      setError('Ошибка регистрации. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(1200px 600px at 85% -10%, rgba(199,226,101,.18), transparent 60%), radial-gradient(1000px 700px at -10% 110%, rgba(47,74,57,.18), transparent 55%), var(--bg)',
      padding: '24px'
    }}>
      {/* Noise overlay */}
      <div className="noise" aria-hidden="true"></div>

      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        position: 'relative',
        zIndex: 2,
        boxShadow: 'var(--shadow)'
      }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <svg style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: 'var(--moss)' }} viewBox="0 0 32 32" fill="none">
            <path d="M16 30C16 30 4 26 4 14C4 8 9 4 16 4C23 4 28 8 28 14C28 26 16 30 16 30Z" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M16 30V12M16 12C16 12 12 14 10 18M16 12C16 12 20 14 22 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '32px',
            fontWeight: '400',
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: '0 0 8px'
          }}>
            Forum<span style={{ color: 'var(--pistachio)' }}>.</span>
          </h1>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'var(--ink-3)',
            letterSpacing: '.04em',
            margin: 0
          }}>
            терминал общения
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--bg-2)',
          border: '1px solid var(--line)',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            style={{
              flex: 1,
              background: isLogin ? 'var(--ink)' : 'transparent',
              color: isLogin ? 'var(--bg)' : 'var(--ink-2)',
              border: 'none',
              padding: '10px 16px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: '.2s'
            }}
          >
            Вход
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            style={{
              flex: 1,
              background: !isLogin ? 'var(--ink)' : 'transparent',
              color: !isLogin ? 'var(--bg)' : 'var(--ink-2)',
              border: 'none',
              padding: '10px 16px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: '.2s'
            }}
          >
            Регистрация
          </button>
        </div>

        {/* Error/Success message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            background: error.startsWith('success:')
              ? 'color-mix(in srgb, var(--pistachio) 15%, var(--paper))'
              : 'color-mix(in srgb, var(--hot) 15%, var(--paper))',
            border: `1px solid ${error.startsWith('success:') ? 'var(--pistachio)' : 'var(--hot)'}`,
            color: 'var(--ink)',
            fontSize: '13px',
            lineHeight: '1.5'
          }}>
            {error.replace('success:', '')}
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: '8px'
              }}>
                Табельный номер или Email
              </label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                placeholder="12345 или user@company.ru"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  padding: '12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                  transition: '.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--moss)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: '8px'
              }}>
                Пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  padding: '12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                  transition: '.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--moss)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--ink)',
                color: 'var(--bg)',
                border: 'none',
                padding: '14px 20px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: '.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--moss)')}
              onMouseLeave={(e) => !loading && (e.target.style.background = 'var(--ink)')}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: '8px'
              }}>
                Табельный номер
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="12345"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  padding: '12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                  transition: '.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--moss)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@company.ru"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  padding: '12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                  transition: '.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--moss)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: '8px'
              }}>
                ФИО
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Иванов Иван Иванович"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  padding: '12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                  transition: '.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--moss)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: '8px'
              }}>
                Пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  padding: '12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                  transition: '.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--moss)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--ink)',
                color: 'var(--bg)',
                border: 'none',
                padding: '14px 20px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: '.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--moss)')}
              onMouseLeave={(e) => !loading && (e.target.style.background = 'var(--ink)')}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        {/* Footer note */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px dashed var(--line)',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--ink-3)',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          Для молодых сотрудников компании
        </div>
      </div>
    </div>
  );
}

export default Auth;
