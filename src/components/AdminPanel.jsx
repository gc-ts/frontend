import { useState, useEffect } from 'react';
import { documentsAPI, knowledgeAPI, employeeAPI, chatAPI } from '../services/api';

function AdminPanel({ currentUser, onBack }) {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [indexStatus, setIndexStatus] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadDocuments(),
        loadCategories(),
        loadIndexStatus()
      ]);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await documentsAPI.getDocuments();
      // API может вернуть объект с полем documents или массив напрямую
      const docs = Array.isArray(response) ? response : (response.documents || []);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await documentsAPI.getCategories();
      const cats = Array.isArray(response) ? response : (response.categories || []);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  const loadIndexStatus = async () => {
    try {
      const status = await knowledgeAPI.getIndexStatus();
      setIndexStatus(status);
    } catch (error) {
      console.error('Failed to load index status:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle || !uploadCategory || !uploadType) {
      alert('Заполните все поля');
      return;
    }

    setIsUploading(true);
    try {
      await documentsAPI.uploadDocument(uploadFile, uploadTitle, uploadCategory, uploadType);
      alert('Документ успешно загружен');
      setUploadFile(null);
      setUploadTitle('');
      setUploadCategory('');
      setUploadType('');
      loadDocuments();
      loadIndexStatus();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Ошибка загрузки документа');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('Удалить документ?')) return;

    try {
      await documentsAPI.deleteDocument(docId);
      alert('Документ удален');
      loadDocuments();
      loadIndexStatus();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Ошибка удаления документа');
    }
  };

  const handleReindex = async () => {
    if (!confirm('Запустить реиндексацию базы знаний?')) return;

    setIsReindexing(true);
    try {
      await knowledgeAPI.reindex();
      alert('Реиндексация запущена');
      setTimeout(loadIndexStatus, 2000);
    } catch (error) {
      console.error('Reindex failed:', error);
      alert('Ошибка реиндексации');
    } finally {
      setIsReindexing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await employeeAPI.searchByName(searchQuery);
      const results = Array.isArray(response) ? response : (response.employees || []);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
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
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '24px',
          fontWeight: '400',
          color: 'var(--ink)',
          margin: 0
        }}>
          🔧 Админ-панель
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        padding: '16px 32px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--paper)',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setActiveTab('documents')}
          style={{
            background: activeTab === 'documents' ? 'var(--ink)' : 'transparent',
            color: activeTab === 'documents' ? 'var(--bg)' : 'var(--ink)',
            border: '1px solid var(--line)',
            padding: '8px 16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: '.2s'
          }}
        >
          Документы
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          style={{
            background: activeTab === 'knowledge' ? 'var(--ink)' : 'transparent',
            color: activeTab === 'knowledge' ? 'var(--bg)' : 'var(--ink)',
            border: '1px solid var(--line)',
            padding: '8px 16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: '.2s'
          }}
        >
          База знаний
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          style={{
            background: activeTab === 'employees' ? 'var(--ink)' : 'transparent',
            color: activeTab === 'employees' ? 'var(--bg)' : 'var(--ink)',
            border: '1px solid var(--line)',
            padding: '8px 16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: '.2s'
          }}
        >
          Сотрудники
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            fontSize: '14px',
            color: 'var(--ink-3)',
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            Загрузка...
          </div>
        ) : error ? (
          <div style={{
            background: 'var(--paper)',
            border: '1px solid var(--hot)',
            padding: '24px',
            color: 'var(--hot)',
            fontSize: '14px'
          }}>
            Ошибка: {error}
          </div>
        ) : (
          <>
            {activeTab === 'documents' && (
          <div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '20px',
              fontWeight: '400',
              color: 'var(--ink)',
              marginBottom: '24px'
            }}>
              Управление документами
            </h2>

            {/* Upload form */}
            <form onSubmit={handleUpload} style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <h3 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '16px',
                fontWeight: '400',
                color: 'var(--ink)',
                marginBottom: '16px'
              }}>
                Загрузить документ
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Название документа"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                    padding: '10px 12px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />

                <input
                  type="text"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  placeholder="Категория (например: HR)"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                    padding: '10px 12px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />

                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                    padding: '10px 12px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Выберите тип</option>
                  <option value="policy">Политика</option>
                  <option value="procedure">Процедура</option>
                  <option value="guide">Руководство</option>
                  <option value="form">Форма</option>
                  <option value="other">Другое</option>
                </select>

                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    id="file-upload"
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="file-upload"
                    style={{
                      display: 'block',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      padding: '10px 12px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: '.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = 'var(--moss)'}
                    onMouseLeave={(e) => e.target.style.borderColor = 'var(--line)'}
                  >
                    {uploadFile ? uploadFile.name : 'Выбрать файл (PDF, DOCX, TXT)'}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    background: 'var(--moss)',
                    color: 'var(--paper)',
                    border: 'none',
                    padding: '10px 20px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    opacity: isUploading ? 0.5 : 1
                  }}
                >
                  {isUploading ? 'Загрузка...' : 'Загрузить'}
                </button>
              </div>
            </form>

            {/* Documents list */}
            <h3 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '16px',
              fontWeight: '400',
              color: 'var(--ink)',
              marginBottom: '16px'
            }}>
              Загруженные документы ({documents.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.map(doc => (
                <div key={doc.id} style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--ink)',
                      marginBottom: '4px'
                    }}>
                      {doc.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--ink-3)',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      {doc.category} • {doc.type} • {doc.filename}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      background: 'var(--hot)',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '20px',
              fontWeight: '400',
              color: 'var(--ink)',
              marginBottom: '24px'
            }}>
              База знаний
            </h2>

            {indexStatus && (
              <div style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '16px',
                  fontWeight: '400',
                  color: 'var(--ink)',
                  marginBottom: '16px'
                }}>
                  Статус индекса
                </h3>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--ink)',
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: '1.8'
                }}>
                  <div>Документов проиндексировано: {indexStatus.documentCount || 0}</div>
                  <div>Чанков в векторном хранилище: {indexStatus.chunkCount || 0}</div>
                  <div>Последняя индексация: {indexStatus.lastIndexed ? new Date(indexStatus.lastIndexed).toLocaleString('ru-RU') : 'Никогда'}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleReindex}
              disabled={isReindexing}
              style={{
                background: 'var(--moss)',
                color: 'var(--paper)',
                border: 'none',
                padding: '12px 24px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                cursor: isReindexing ? 'not-allowed' : 'pointer',
                opacity: isReindexing ? 0.5 : 1
              }}
            >
              {isReindexing ? 'Реиндексация...' : 'Запустить реиндексацию'}
            </button>
          </div>
        )}

        {activeTab === 'employees' && (
          <div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '20px',
              fontWeight: '400',
              color: 'var(--ink)',
              marginBottom: '24px'
            }}>
              Поиск сотрудников
            </h2>

            <div style={{
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Введите имя сотрудника..."
                  style={{
                    flex: 1,
                    background: 'var(--bg)',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                    padding: '10px 12px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    background: 'var(--moss)',
                    color: 'var(--paper)',
                    border: 'none',
                    padding: '10px 20px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  Найти
                </button>
              </div>

              {searchResults.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {searchResults.map(emp => (
                    <div key={emp.id} style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      padding: '12px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'var(--ink)',
                        marginBottom: '4px'
                      }}>
                        {emp.full_name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--ink-3)',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}>
                        ID: {emp.employee_id} • {emp.position} • {emp.department}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
