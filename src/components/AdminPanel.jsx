import { useCallback, useEffect, useMemo, useState } from 'react';
import { documentsAPI, employeeAPI, knowledgeAPI } from '../services/api';

const employeeFields = [
  { name: 'employeeId', label: 'Табельный номер', required: true },
  { name: 'fullName', label: 'ФИО', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'password', label: 'Пароль', type: 'password', createOnly: true },
  { name: 'position', label: 'Должность' },
  { name: 'department', label: 'Отдел' },
  { name: 'phone', label: 'Телефон' },
  { name: 'middleName', label: 'Отчество' },
  { name: 'city', label: 'Город' },
  { name: 'telegram', label: 'Telegram' },
  { name: 'additionalEmail', label: 'Доп. email', type: 'email' },
  { name: 'oneCCode', label: 'Код 1С' },
  { name: 'birthDate', label: 'Дата рождения', type: 'date' },
  { name: 'hireDate', label: 'Дата приема', type: 'date' },
  { name: 'medicalExamDate', label: 'Медосмотр', type: 'date' },
  { name: 'sanitaryMinimumDate', label: 'Санминимум', type: 'date' },
  { name: 'vacationDays', label: 'Дней отпуска', type: 'number' },
  { name: 'salary', label: 'Оклад', type: 'number' },
  { name: 'bonusBalance', label: 'Бонусный баланс', type: 'number' }
];

const emptyEmployee = employeeFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {
  role: 'employee'
});

const emptyVacation = {
  startDate: '',
  endDate: '',
  days: '',
  status: 'planned'
};

const numberFields = new Set(['vacationDays', 'salary', 'bonusBalance']);
const normalizeDate = (value) => (value ? String(value).slice(0, 10) : '');

const toEmployeeForm = (employee = {}) => ({
  ...emptyEmployee,
  ...employee,
  employeeId: employee.employeeId || employee.id || '',
  role: employee.role || 'employee',
  birthDate: normalizeDate(employee.birthDate),
  hireDate: normalizeDate(employee.hireDate),
  medicalExamDate: normalizeDate(employee.medicalExamDate),
  sanitaryMinimumDate: normalizeDate(employee.sanitaryMinimumDate),
  vacationDays: employee.vacationDays ?? '',
  salary: employee.salary ?? '',
  bonusBalance: employee.bonusBalance ?? '',
  password: ''
});

const buildEmployeePayload = (form, mode) => {
  const payload = {};

  employeeFields.forEach((field) => {
    if (field.createOnly && mode !== 'create') return;

    const value = form[field.name];
    if (value === '' && field.name === 'password') return;
    if (numberFields.has(field.name)) {
      payload[field.name] = value === '' ? null : Number(value);
      return;
    }
    payload[field.name] = value === '' ? null : value;
  });

  payload.role = form.role || 'employee';
  return payload;
};

function AdminPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState('employees');
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [indexStatus, setIndexStatus] = useState(null);
  const [corporateSync, setCorporateSync] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeMode, setEmployeeMode] = useState('create');
  const [employeeForm, setEmployeeForm] = useState(emptyEmployee);
  const [vacationForm, setVacationForm] = useState(emptyVacation);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const indexTotal = indexStatus?.stats?.total ?? 0;
  const indexDocuments = indexStatus?.documents || [];

  const categoryOptions = useMemo(() => {
    const fromDocs = documents.map((doc) => doc.category).filter(Boolean);
    return Array.from(new Set([...categories, ...fromDocs]));
  }, [categories, documents]);

  const loadDocuments = useCallback(async () => {
    const response = await documentsAPI.getDocuments();
    setDocuments(Array.isArray(response) ? response : response.documents || []);
  }, []);

  const loadCategories = useCallback(async () => {
    const response = await documentsAPI.getCategories();
    setCategories(Array.isArray(response) ? response : response.categories || []);
  }, []);

  const loadKnowledge = useCallback(async () => {
    const [indexResponse, syncResponse] = await Promise.allSettled([
      knowledgeAPI.getIndexStatus(),
      knowledgeAPI.getCorporateSync()
    ]);

    if (indexResponse.status === 'fulfilled') setIndexStatus(indexResponse.value);
    if (syncResponse.status === 'fulfilled') setCorporateSync(syncResponse.value);
  }, []);

  const loadEmployees = useCallback(async (search = '') => {
    const response = await employeeAPI.adminList({ search, limit: 100, offset: 0 });
    const list = Array.isArray(response) ? response : response.employees || [];
    setEmployees(list);
    return list;
  }, []);

  const loadInitialData = useCallback(async () => {
    setBusy('initial');
    setError('');

    try {
      const results = await Promise.allSettled([
        loadDocuments(),
        loadCategories(),
        loadKnowledge(),
        loadEmployees('')
      ]);
      const employeesResult = results[3];

      if (employeesResult.status === 'fulfilled' && employeesResult.value[0]) {
        const firstEmployee = employeesResult.value[0];
        setSelectedEmployeeId(firstEmployee.id);
        setEmployeeMode('edit');
        setEmployeeForm(toEmployeeForm(firstEmployee));
      }

      const failed = results.find((result) => result.status === 'rejected');
      if (failed) setError(failed.reason?.message || 'Часть данных админки не загрузилась');
    } finally {
      setBusy('');
    }
  }, [loadCategories, loadDocuments, loadEmployees, loadKnowledge]);

  useEffect(() => {
    const timer = window.setTimeout(loadInitialData, 0);
    return () => window.clearTimeout(timer);
  }, [loadInitialData]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2500);
  };

  const handleEmployeeSelect = async (employeeId) => {
    setBusy(`employee-${employeeId}`);
    setError('');

    try {
      const response = await employeeAPI.adminGet(employeeId);
      const employee = response.employee || response;
      setSelectedEmployeeId(employee.id);
      setEmployeeMode('edit');
      setEmployeeForm(toEmployeeForm(employee));
    } catch (err) {
      setError(err.message || 'Не удалось загрузить сотрудника');
    } finally {
      setBusy('');
    }
  };

  const handleEmployeeSubmit = async (event) => {
    event.preventDefault();
    setBusy('employee-save');
    setError('');

    try {
      const payload = buildEmployeePayload(employeeForm, employeeMode);
      const response = employeeMode === 'create'
        ? await employeeAPI.adminCreate(payload)
        : await employeeAPI.adminUpdate(selectedEmployeeId, payload);
      const employee = response.employee || response;

      setSelectedEmployeeId(employee.id);
      setEmployeeMode('edit');
      setEmployeeForm(toEmployeeForm(employee));
      await loadEmployees(employeeSearch);
      showNotice(employeeMode === 'create' ? 'Сотрудник создан' : 'Карточка обновлена');
    } catch (err) {
      setError(err.message || 'Не удалось сохранить сотрудника');
    } finally {
      setBusy('');
    }
  };

  const handleEmployeeDelete = async () => {
    if (!selectedEmployeeId || !window.confirm('Удалить карточку сотрудника?')) return;

    setBusy('employee-delete');
    setError('');

    try {
      await employeeAPI.adminDelete(selectedEmployeeId);
      setSelectedEmployeeId('');
      setEmployeeMode('create');
      setEmployeeForm(emptyEmployee);
      await loadEmployees(employeeSearch);
      showNotice('Сотрудник удален');
    } catch (err) {
      setError(err.message || 'Не удалось удалить сотрудника');
    } finally {
      setBusy('');
    }
  };

  const handleVacationSubmit = async (event) => {
    event.preventDefault();
    if (!selectedEmployeeId) return;

    setBusy('vacation-save');
    setError('');

    try {
      await employeeAPI.adminAddVacation(selectedEmployeeId, {
        startDate: vacationForm.startDate,
        endDate: vacationForm.endDate,
        days: Number(vacationForm.days),
        status: vacationForm.status || 'planned'
      });
      setVacationForm(emptyVacation);
      showNotice('Плановый отпуск добавлен');
    } catch (err) {
      setError(err.message || 'Не удалось добавить отпуск');
    } finally {
      setBusy('');
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!uploadFile) {
      setError('Выберите файл для загрузки');
      return;
    }

    setBusy('upload');
    setError('');

    try {
      await documentsAPI.uploadDocument(uploadFile, uploadTitle, uploadCategory, uploadType);
      setUploadFile(null);
      setUploadTitle('');
      setUploadCategory('');
      setUploadType('');
      await Promise.all([loadDocuments(), loadCategories(), loadKnowledge()]);
      showNotice('Документ загружен');
    } catch (err) {
      setError(err.message || 'Не удалось загрузить документ');
    } finally {
      setBusy('');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Удалить документ вместе с чанками RAG?')) return;

    setBusy(`document-${documentId}`);
    setError('');

    try {
      await documentsAPI.deleteDocument(documentId);
      await Promise.all([loadDocuments(), loadKnowledge()]);
      showNotice('Документ удален');
    } catch (err) {
      setError(err.message || 'Не удалось удалить документ');
    } finally {
      setBusy('');
    }
  };

  const handleReindex = async () => {
    if (!window.confirm('Запустить переиндексацию базы знаний?')) return;

    setBusy('reindex');
    setError('');

    try {
      await knowledgeAPI.reindex();
      await loadKnowledge();
      showNotice('Переиндексация запущена');
    } catch (err) {
      setError(err.message || 'Не удалось запустить переиндексацию');
    } finally {
      setBusy('');
    }
  };

  const handleCorporateSync = async () => {
    setBusy('corporate-sync');
    setError('');

    try {
      await knowledgeAPI.syncCorporate();
      await loadKnowledge();
      showNotice('Синхронизация запущена');
    } catch (err) {
      setError(err.message || 'Не удалось запустить синхронизацию');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <button className="admin-outline-btn" onClick={onBack} type="button">Назад</button>
        <div>
          <h1>Админ-панель</h1>
          <span>Документы, RAG-индекс и карточки сотрудников</span>
        </div>
      </header>

      <nav className="admin-tabs">
        {[
          ['employees', 'Сотрудники'],
          ['documents', 'Документы'],
          ['knowledge', 'База знаний']
        ].map(([id, label]) => (
          <button
            className={activeTab === id ? 'active' : ''}
            key={id}
            onClick={() => setActiveTab(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      {(error || notice) && (
        <div className={`admin-message ${error ? 'error' : ''}`}>{error || notice}</div>
      )}

      <main className="admin-content">
        {busy === 'initial' ? (
          <div className="admin-empty">Загрузка...</div>
        ) : (
          <>
            {activeTab === 'employees' && (
              <section className="admin-employees-layout">
                <aside className="admin-list-panel">
                  <div className="admin-search-row">
                    <input
                      value={employeeSearch}
                      onChange={(event) => setEmployeeSearch(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && loadEmployees(employeeSearch)}
                      placeholder="ФИО, email, табельный..."
                    />
                    <button type="button" onClick={() => loadEmployees(employeeSearch)}>Найти</button>
                  </div>

                  <button
                    className="admin-create-btn"
                    type="button"
                    onClick={() => {
                      setEmployeeMode('create');
                      setSelectedEmployeeId('');
                      setEmployeeForm(emptyEmployee);
                    }}
                  >
                    Новый сотрудник
                  </button>

                  <div className="admin-employee-list">
                    {employees.map((employee) => (
                      <button
                        className={selectedEmployeeId === employee.id ? 'active' : ''}
                        key={employee.id}
                        onClick={() => handleEmployeeSelect(employee.id)}
                        type="button"
                      >
                        <strong>{employee.fullName || 'Без имени'}</strong>
                        <span>{employee.id} · {employee.position || '—'} · {employee.department || '—'}</span>
                      </button>
                    ))}
                  </div>
                </aside>

                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2>{employeeMode === 'create' ? 'Создать сотрудника' : 'Редактировать карточку'}</h2>
                    {employeeMode === 'edit' && (
                      <button className="admin-danger-btn" type="button" onClick={handleEmployeeDelete}>
                        Удалить
                      </button>
                    )}
                  </div>

                  <form className="admin-form-grid" onSubmit={handleEmployeeSubmit}>
                    {employeeFields
                      .filter((field) => employeeMode === 'create' || !field.createOnly)
                      .map((field) => (
                        <label key={field.name}>
                          <span>{field.label}</span>
                          <input
                            type={field.type || 'text'}
                            value={employeeForm[field.name] ?? ''}
                            required={field.required}
                            min={field.type === 'number' ? 0 : undefined}
                            onChange={(event) => setEmployeeForm((current) => ({
                              ...current,
                              [field.name]: event.target.value
                            }))}
                          />
                        </label>
                      ))}

                    <label>
                      <span>Роль</span>
                      <select
                        value={employeeForm.role}
                        onChange={(event) => setEmployeeForm((current) => ({ ...current, role: event.target.value }))}
                      >
                        <option value="employee">employee</option>
                        <option value="admin">admin</option>
                      </select>
                    </label>

                    <div className="admin-form-actions">
                      <button className="admin-primary-btn" type="submit" disabled={busy === 'employee-save'}>
                        {busy === 'employee-save' ? 'Сохранение...' : 'Сохранить'}
                      </button>
                    </div>
                  </form>

                  {employeeMode === 'edit' && (
                    <form className="admin-vacation-form" onSubmit={handleVacationSubmit}>
                      <h3>Плановый отпуск</h3>
                      <label>
                        <span>Начало</span>
                        <input
                          type="date"
                          value={vacationForm.startDate}
                          onChange={(event) => setVacationForm((current) => ({ ...current, startDate: event.target.value }))}
                          required
                        />
                      </label>
                      <label>
                        <span>Окончание</span>
                        <input
                          type="date"
                          value={vacationForm.endDate}
                          onChange={(event) => setVacationForm((current) => ({ ...current, endDate: event.target.value }))}
                          required
                        />
                      </label>
                      <label>
                        <span>Дней</span>
                        <input
                          type="number"
                          min="1"
                          value={vacationForm.days}
                          onChange={(event) => setVacationForm((current) => ({ ...current, days: event.target.value }))}
                          required
                        />
                      </label>
                      <label>
                        <span>Статус</span>
                        <input
                          value={vacationForm.status}
                          onChange={(event) => setVacationForm((current) => ({ ...current, status: event.target.value }))}
                        />
                      </label>
                      <button className="admin-outline-btn" type="submit" disabled={busy === 'vacation-save'}>
                        Добавить отпуск
                      </button>
                    </form>
                  )}
                </section>
              </section>
            )}

            {activeTab === 'documents' && (
              <section className="admin-stack">
                <form className="admin-card admin-upload-form" onSubmit={handleUpload}>
                  <div className="admin-card-header">
                    <h2>Загрузить документ</h2>
                    <span>PDF, DOCX, TXT, MD</span>
                  </div>
                  <input value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} placeholder="Название" />
                  <input
                    list="admin-categories"
                    value={uploadCategory}
                    onChange={(event) => setUploadCategory(event.target.value)}
                    placeholder="Категория"
                  />
                  <datalist id="admin-categories">
                    {categoryOptions.map((category) => <option key={category} value={category} />)}
                  </datalist>
                  <input value={uploadType} onChange={(event) => setUploadType(event.target.value)} placeholder="Тип, например ЛНА" />
                  <input type="file" accept=".pdf,.docx,.txt,.md" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} />
                  <button className="admin-primary-btn" type="submit" disabled={busy === 'upload'}>
                    {busy === 'upload' ? 'Загрузка...' : 'Загрузить'}
                  </button>
                </form>

                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2>Документы</h2>
                    <span>{documents.length}</span>
                  </div>
                  <div className="admin-table">
                    {documents.map((doc) => (
                      <div className="admin-table-row" key={doc.id}>
                        <div>
                          <strong>{doc.title || doc.id}</strong>
                          <span>{doc.category || '—'} · {doc.type || '—'} · чанков: {doc.chunkCount ?? '—'}</span>
                        </div>
                        <button className="admin-danger-btn" type="button" onClick={() => handleDeleteDocument(doc.id)}>
                          Удалить
                        </button>
                      </div>
                    ))}
                    {!documents.length && <div className="admin-empty">Документов пока нет</div>}
                  </div>
                </section>
              </section>
            )}

            {activeTab === 'knowledge' && (
              <section className="admin-stack">
                <section className="admin-metrics">
                  <div>
                    <span>Чанков</span>
                    <strong>{indexTotal}</strong>
                  </div>
                  <div>
                    <span>Документов в индексе</span>
                    <strong>{indexDocuments.length}</strong>
                  </div>
                  <div>
                    <span>Corporate sync</span>
                    <strong>{corporateSync?.configured ? 'Настроен' : 'Не настроен'}</strong>
                  </div>
                  <div>
                    <span>Расписание</span>
                    <strong>{corporateSync?.schedule || '—'}</strong>
                  </div>
                </section>

                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2>Управление индексом</h2>
                    <span>RAG и корпоративный портал</span>
                  </div>
                  <div className="admin-actions-row">
                    <button className="admin-primary-btn" type="button" onClick={handleReindex} disabled={busy === 'reindex'}>
                      Переиндексировать
                    </button>
                    <button className="admin-outline-btn" type="button" onClick={handleCorporateSync} disabled={busy === 'corporate-sync'}>
                      Синхронизировать портал
                    </button>
                  </div>
                  <div className="admin-sync-meta">
                    <span>Последняя синхронизация: {corporateSync?.lastSync ? new Date(corporateSync.lastSync).toLocaleString('ru-RU') : '—'}</span>
                    <span>Следующая: {corporateSync?.nextSync ? new Date(corporateSync.nextSync).toLocaleString('ru-RU') : '—'}</span>
                  </div>
                </section>

                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2>Документы индекса</h2>
                    <span>{indexDocuments.length}</span>
                  </div>
                  <div className="admin-table">
                    {indexDocuments.map((doc) => (
                      <div className="admin-table-row" key={doc.id}>
                        <div>
                          <strong>{doc.title || doc.id}</strong>
                          <span>{doc.category || '—'} · {doc.type || '—'} · чанков: {doc.chunkCount ?? '—'}</span>
                        </div>
                      </div>
                    ))}
                    {!indexDocuments.length && <div className="admin-empty">Индекс пуст</div>}
                  </div>
                </section>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminPanel;
