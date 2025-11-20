import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const audioRef = useRef(null)

  // 发送请求
  const handleGenerate = async () => {
    if (!text.trim()) return

    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      })

      const data = await response.json()

      if (response.ok) {
        // 添加到历史记录
        const newRecord = {
          id: data.id || Date.now(),
          text: data.text,
          audioUrl: data.audio_url
        }
        setHistory(prev => [newRecord, ...prev])

        // 自动播放最新的一条
        if (audioRef.current) {
          audioRef.current.src = data.audio_url
          audioRef.current.play().catch(e => console.log("自动播放被拦截:", e))
        }

        setText('') // 清空输入框
      } else {
        alert('生成失败: ' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('Request failed', error)
      alert('网络错误，请检查 Django 是否运行')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>GPT-SoVITS 语音合成</h1>

      {/* 这里的 hidden audio 标签用于自动播放逻辑 */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      <div className="input-area">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入想要转换的文字..."
          rows={4}
          disabled={loading}
        />
        <button onClick={handleGenerate} disabled={loading || !text}>
          {loading ? '生成中...' : '发送推理'}
        </button>
      </div>

      <div className="history-area">
        <h2>历史记录</h2>
        {history.length === 0 && <p style={{ color: '#666' }}>暂无生成记录</p>}

        <div className="record-list">
          {history.map((item) => (
            <div key={item.id} className="record-card">
              <p className="record-text">{item.text}</p>
              <audio controls src={item.audioUrl} className="record-audio" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
