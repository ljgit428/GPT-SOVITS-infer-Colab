import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  // 从本地存储读取历史，如果没有则为空数组
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('tts_history')
    return saved ? JSON.parse(saved) : []
  })

  // 新增：语言选择
  const [lang, setLang] = useState('auto')
  // 新增：忽略括号内容开关
  const [ignoreBrackets, setIgnoreBrackets] = useState(true)

  const audioRef = useRef(null)

  // 每次 history 变化时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('tts_history', JSON.stringify(history))
  }, [history])

  const handleGenerate = async () => {
    if (!text.trim()) return

    setLoading(true)
    try {
      // 注意：这里需要把 lang 传给后端
      // 你需要在 Django 的 views.py 里接收 text_lang 参数
      const response = await fetch('http://127.0.0.1:8000/api/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          text_lang: lang, // 传递语言参数
          ignore_brackets: ignoreBrackets // 传给后端
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const newRecord = {
          id: data.id || Date.now(),
          text: data.text,
          audioUrl: data.audio_url,
          lang: lang, // 记录使用的语言
          date: new Date().toLocaleString()
        }
        setHistory(prev => [newRecord, ...prev])

        if (audioRef.current) {
          audioRef.current.src = data.audio_url
          audioRef.current.play().catch(e => console.log("自动播放被拦截:", e))
        }
        setText('')
      } else {
        alert('生成失败: ' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('Request failed', error)
      alert('网络错误，请检查后端服务')
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setHistory([])
      localStorage.removeItem('tts_history')
    }
  }

  return (
    <div className="container">
      <div className="header-area">
        <h1>GPT-SoVITS 在线推理</h1>
        <p className="subtitle">基于 Colab T4 GPU 的实时语音合成</p>
      </div>

      {/* 左侧：输入区 */}
      <div className="card input-card">
        <h2>✨ 开始合成</h2>

        <div className="controls">
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="auto">自动识别语言 (Auto)</option>
            <option value="zh">中文 (Chinese)</option>
            <option value="ja">日文 (Japanese)</option>
            <option value="en">英文 (English)</option>
            <option value="all_zh">强制中文发音</option>
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
            忽略括号内容 (如：[笑声]、(旁白))
          </label>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入想要转换的文字... (例如：你好，我是Seia)"
          disabled={loading}
        />

        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !text}
        >
          {loading ? '⚡ 正在推理中...' : '🚀 发送推理'}
        </button>

        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>

      {/* 右侧：历史记录 */}
      <div className="card history-card">
        <div className="history-header">
          <h2>📜 历史记录 ({history.length})</h2>
          {history.length > 0 && (
            <button className="clear-btn" onClick={clearHistory}>清空</button>
          )}
        </div>

        <div className="record-list">
          {history.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              暂无记录，快去生成一条吧！
            </div>
          )}

          {history.map((item) => (
            <div key={item.id} className="record-item">
              <div className="record-meta">
                <span>[{item.lang === 'auto' ? '自动' : item.lang}] {item.date}</span>
              </div>
              <div className="record-text">{item.text}</div>
              <audio controls src={item.audioUrl} controlsList="nodownload" />
              {/* 如果需要下载按钮，可以额外加一个 a 标签 */}
              <div style={{ marginTop: '5px', textAlign: 'right' }}>
                <a href={item.audioUrl} download={`tts_${item.id}.wav`} style={{ fontSize: '0.8rem', color: '#646cff' }}>下载音频</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
