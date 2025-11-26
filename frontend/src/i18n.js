export const translations = {
    en: {
        title: 'GPT-SoVITS Online Inference',
        subtitle: 'Real-time speech synthesis powered by Colab T4 GPU',
        startSynthesis: '✨ Start Synthesis',
        languageSelection: {
            auto: 'Auto Detect Language (Auto)',
            zh: 'Chinese',
            ja: 'Japanese',
            en: 'English',
            allZh: 'Force Chinese Pronunciation'
        },
        ignoreBrackets: 'Ignore brackets (e.g., [laughter], (narration))',
        placeholder: 'Enter the text you want to convert... (e.g., Hello, I am Seia)',
        generating: '⚡ Generating...',
        sendInference: '🚀 Send Inference',
        history: '📜 History',
        clear: 'Clear',
        noRecords: 'No records yet, go generate one!',
        downloadAudio: 'Download Audio',
        confirmClear: 'Are you sure you want to clear all history?',
        generationFailed: 'Generation failed: ',
        unknownError: 'Unknown error',
        networkError: 'Network error, please check backend service',
        langDisplay: {
            auto: 'Auto',
            zh: 'ZH',
            ja: 'JA',
            en: 'EN',
            all_zh: 'ZH-Force'
        },
        switchLanguage: 'Switch Language'
    },
    zh: {
        title: 'GPT-SoVITS 在线推理',
        subtitle: '基于 Colab T4 GPU 的实时语音合成',
        startSynthesis: '✨ 开始合成',
        languageSelection: {
            auto: '自动识别语言 (Auto)',
            zh: '中文 (Chinese)',
            ja: '日文 (Japanese)',
            en: '英文 (English)',
            allZh: '强制中文发音'
        },
        ignoreBrackets: '忽略括号内容 (如：[笑声]、(旁白))',
        placeholder: '请输入想要转换的文字... (例如：你好，我是Seia)',
        generating: '⚡ 正在推理中...',
        sendInference: '🚀 发送推理',
        history: '📜 历史记录',
        clear: '清空',
        noRecords: '暂无记录，快去生成一条吧！',
        downloadAudio: '下载音频',
        confirmClear: '确定要清空所有历史记录吗？',
        generationFailed: '生成失败：',
        unknownError: '未知错误',
        networkError: '网络错误，请检查后端服务',
        langDisplay: {
            auto: '自动',
            zh: '中文',
            ja: '日文',
            en: '英文',
            all_zh: '强制中文'
        },
        switchLanguage: '切换语言'
    }
}

export const getTranslation = (lang, key) => {
    const keys = key.split('.')
    let value = translations[lang]
    for (const k of keys) {
        value = value?.[k]
    }
    return value || key
}
