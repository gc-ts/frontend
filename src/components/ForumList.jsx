import { forumArticles, forumCategories } from '../data/forumArticles';

function ForumList({ onArticleSelect }) {
  const getArticlesByCategory = (categoryName) => {
    return forumArticles.filter(article => article.category === categoryName);
  };

  return (
    <div style={{
      padding: '48px',
      overflowY: 'auto',
      height: '100%',
      background: 'var(--bg)'
    }}>
      <h1 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: '42px',
        fontWeight: '300',
        letterSpacing: '-0.025em',
        color: 'var(--ink)',
        margin: '0 0 16px'
      }}>
        База знаний<span style={{ color: 'var(--pistachio)' }}>.</span>
      </h1>
      <p style={{
        fontSize: '15px',
        color: 'var(--ink-2)',
        marginBottom: '48px',
        maxWidth: '600px'
      }}>
        Справочные материалы по правилам внутреннего трудового распорядка. Выберите интересующую вас тему.
      </p>

      {forumCategories.map(category => {
        const articles = getArticlesByCategory(category.name);
        if (articles.length === 0) return null;

        return (
          <div key={category.id} style={{ marginBottom: '48px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--line)'
            }}>
              <span style={{ fontSize: '28px' }}>{category.icon}</span>
              <div>
                <h2 style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '28px',
                  fontWeight: '400',
                  color: 'var(--ink)',
                  margin: 0
                }}>
                  {category.name}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--ink-3)',
                  margin: '4px 0 0'
                }}>
                  {category.description}
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {articles.map(article => (
                <div
                  key={article.id}
                  onClick={() => onArticleSelect(article)}
                  style={{
                    background: 'var(--paper)',
                    border: '1px solid var(--line)',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: '.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--moss)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--line)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '12px'
                  }}>
                    {article.icon}
                  </div>
                  <h3 style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: '20px',
                    fontWeight: '400',
                    color: 'var(--ink)',
                    margin: '0 0 8px'
                  }}>
                    {article.title}
                  </h3>
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--ink-2)',
                    lineHeight: '1.5'
                  }}>
                    {article.content.split('\n').find(line => line.startsWith('## '))?.slice(3) || 'Подробная информация'}
                  </div>
                  <div style={{
                    marginTop: '16px',
                    fontSize: '11px',
                    color: 'var(--moss)',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '.08em',
                    textTransform: 'uppercase'
                  }}>
                    Читать →
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ForumList;
