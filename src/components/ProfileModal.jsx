import { useState } from 'react';
import { employeeAPI } from '../services/api';

const editableFields = [
  { name: 'fullName', label: 'ФИО', type: 'text', required: true, section: 'Основное' },
  { name: 'middleName', label: 'Отчество', type: 'text', section: 'Основное' },
  { name: 'email', label: 'Email', type: 'email', required: true, section: 'Контакты' },
  { name: 'additionalEmail', label: 'Дополнительный email', type: 'email', section: 'Контакты' },
  { name: 'phone', label: 'Телефон', type: 'tel', section: 'Контакты' },
  { name: 'telegram', label: 'Telegram', type: 'text', section: 'Контакты' },
  { name: 'city', label: 'Город', type: 'text', section: 'Контакты' },
  { name: 'position', label: 'Должность', type: 'text', section: 'Работа' },
  { name: 'department', label: 'Отдел', type: 'text', section: 'Работа' },
  { name: 'hireDate', label: 'Дата приема', type: 'date', section: 'Работа' },
  { name: 'oneCCode', label: 'Код 1С', type: 'text', section: 'Работа' },
  { name: 'vacationDays', label: 'Дней отпуска', type: 'number', min: 0, section: 'Работа' },
  { name: 'salary', label: 'Оклад', type: 'number', min: 0, section: 'Финансы' },
  { name: 'bonusBalance', label: 'Бонусный баланс', type: 'number', min: 0, section: 'Финансы' },
  { name: 'birthDate', label: 'Дата рождения', type: 'date', section: 'Дополнительно' },
  { name: 'medicalExamDate', label: 'Медосмотр', type: 'date', section: 'Дополнительно' },
  { name: 'sanitaryMinimumDate', label: 'Санминимум', type: 'date', section: 'Дополнительно' }
];

const readonlyFields = [
  { name: 'employeeId', label: 'Табельный номер' },
  { name: 'role', label: 'Роль' }
];

const dateFields = new Set(['birthDate', 'hireDate', 'medicalExamDate', 'sanitaryMinimumDate']);
const numberFields = new Set(['vacationDays', 'salary', 'bonusBalance']);

const initialForm = (user) => {
  const data = {};

  editableFields.forEach(({ name }) => {
    const value = user?.[name];
    data[name] = dateFields.has(name) && value ? String(value).slice(0, 10) : value ?? '';
  });

  return data;
};

const initials = (name) => {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const formatValue = (name, value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (dateFields.has(name)) return new Date(value).toLocaleDateString('ru-RU');
  if (name === 'salary') return Number(value).toLocaleString('ru-RU');
  return value;
};

const buildPayload = (formData) => {
  const payload = {};

  editableFields.forEach(({ name }) => {
    const value = formData[name];

    if (numberFields.has(name)) {
      payload[name] = value === '' ? null : Number(value);
      return;
    }

    payload[name] = value === '' ? null : value;
  });

  return payload;
};

function ProfileModal({ user, onClose, onLogout, onUserUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => initialForm(user));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleEdit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setError('');
    setFormData(initialForm(user));
    setIsEditing(true);
  };

  const handleCancel = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setFormData(initialForm(user));
    setError('');
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const result = await employeeAPI.updateEmployee(user.employeeId, buildPayload(formData));
      const updatedEmployee = result.employee || result;
      onUserUpdate(updatedEmployee);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  const sections = editableFields.reduce((acc, field) => {
    acc[field.section] = acc[field.section] || [];
    acc[field.section].push(field);
    return acc;
  }, {});

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <div className="profile-modal-header">
          <button className="profile-close-btn" onClick={onClose} type="button" aria-label="Закрыть">
            ×
          </button>

          <div className="profile-avatar-large">{initials(isEditing ? formData.fullName : user?.fullName)}</div>
          <div className="profile-heading">
            <h2>{isEditing ? formData.fullName || 'Пользователь' : user?.fullName || 'Пользователь'}</h2>
            <span>ID: {user?.employeeId || '—'}</span>
          </div>
        </div>

        {error && <div className="profile-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-readonly-grid">
            {readonlyFields.map((field) => (
              <div className="profile-readonly-item" key={field.name}>
                <span>{field.label}</span>
                <strong>{formatValue(field.name, user?.[field.name])}</strong>
              </div>
            ))}
          </div>

          {Object.entries(sections).map(([sectionName, fields]) => (
            <section className="profile-edit-section" key={sectionName}>
              <h3>{sectionName}</h3>
              <div className="profile-fields-grid">
                {fields.map((field) => (
                  <label className="profile-input-group" key={field.name}>
                    <span>{field.label}</span>
                    {isEditing ? (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        min={field.min}
                        disabled={saving}
                      />
                    ) : (
                      <strong>{formatValue(field.name, user?.[field.name])}</strong>
                    )}
                  </label>
                ))}
              </div>
            </section>
          ))}

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="profile-secondary-btn" type="button" onClick={handleCancel} disabled={saving}>
                  Отменить
                </button>
                <button className="profile-primary-btn" type="submit" disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </>
            ) : (
              <>
                <button className="profile-secondary-btn" type="button" onClick={onLogout}>
                  Выйти
                </button>
                <button className="profile-primary-btn" type="button" onClick={handleEdit}>
                  Редактировать
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
