import { useState, useRef, useEffect } from 'react'
import './App.css'
import { getTranslation } from './i18n'

function App() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('tts_history')
    return saved ? JSON.parse(saved) : []
  })
  const [lang, setLang] = useState('en')
  const [ignoreBrackets, setIgnoreBrackets] = useState(true)
  const [uiLang, setUiLang] = useState(() => {
    const saved = localStorage.getItem('ui_lang')
    return saved || 'en'
  })
  const audioRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('tts_history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('ui_lang', uiLang)
  }, [uiLang])

  const t = (key) => getTranslation(uiLang, key)

  const getApiBaseUrl = () => {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000'
    }
    return `http://${hostname}:8000`
  }

  const handleGenerate = async () => {
    if (!text.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/generate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          text_lang: lang,
          ignore_brackets: ignoreBrackets
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const newRecord = {
          id: data.id || Date.now(),
          text: data.text,
          audioUrl: data.audio_url,
          lang: lang,
          date: new Date().toLocaleString()
        }
        setHistory(prev => [newRecord, ...prev])

        if (audioRef.current) {
          audioRef.current.src = data.audio_url
          //audioRef.current.play().catch(e => console.log("Auto-play blocked:", e))
        }
        setText('')
      } else {
        alert(t('generationFailed') + (data.error || t('unknownError')))
      }
    } catch (error) {
      console.error('Request failed', error)
      alert(t('networkError'))
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    if (confirm(t('confirmClear'))) {
      setHistory([])
      localStorage.removeItem('tts_history')
    }
  }

  const toggleLanguage = () => {
    setUiLang(prev => prev === 'en' ? 'zh' : 'en')
  }

  const deleteHistoryItem = (id) => {
    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory)
  }

  return (
    <div className="container">
      <div className="header-area">
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
        <button
          onClick={toggleLanguage}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            background: 'rgba(100, 108, 255, 0.1)',
            border: '1px solid rgba(100, 108, 255, 0.3)',
            borderRadius: '8px',
            color: '#646cff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(100, 108, 255, 0.2)'
            e.target.style.borderColor = '#646cff'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(100, 108, 255, 0.1)'
            e.target.style.borderColor = 'rgba(100, 108, 255, 0.3)'
          }}
        >
          {uiLang === 'en' ? '中文' : 'English'}
        </button>
      </div>

      <div className="card input-card">
        <h2>{t('startSynthesis')}</h2>

        <div className="controls">
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">{t('languageSelection.en')}</option>
            <option value="zh">{t('languageSelection.zh')}</option>
            <option value="ja">{t('languageSelection.ja')}</option>
            <option value="all_zh">{t('languageSelection.allZh')}</option>
            <option value="auto">{t('languageSelection.auto')}</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#aaa', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={ignoreBrackets}
              onChange={e => setIgnoreBrackets(e.target.checked)}
              style={{ marginRight: '8px', width: 'auto' }}
            />
            {t('ignoreBrackets')}
          </label>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('placeholder')}
          disabled={loading}
        />

        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !text}
        >
          {loading ? t('generating') : t('sendInference')}
        </button>

        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>

      <div className="card history-card">
        <div className="history-header">
          <h2>{t('history')} ({history.length})</h2>
          {history.length > 0 && (
            <button className="clear-btn" onClick={clearHistory}>{t('clear')}</button>
          )}
        </div>

        <div className="record-list">
          {history.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              {t('noRecords')}
            </div>
          )}

          {history.map((item) => (
            <div key={item.id} className="record-item">
              <div className="record-meta">
                <span>[{t(`langDisplay.${item.lang}`) || item.lang}] {item.date}</span>
                <button 
                  onClick={() => deleteHistoryItem(item.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(248, 113, 113, 0.5)',
                    color: '#f87171',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(248, 113, 113, 0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {t('delete')}
                </button>
              </div>
              <div className="record-text">{item.text}</div>
              <audio controls src={item.audioUrl} controlsList="nodownload" />
              <div style={{ marginTop: '5px', textAlign: 'right' }}>
                <a href={item.audioUrl} download={`tts_${item.id}.wav`} style={{ fontSize: '0.8rem', color: '#646cff' }}>{t('downloadAudio')}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
