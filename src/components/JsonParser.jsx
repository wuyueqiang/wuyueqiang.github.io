import { useState, useCallback } from 'react'
import { Copy, Trash2, Minimize2, Maximize2, Check } from 'lucide-react'

function highlightJson(jsonStr) {
  return jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-300' // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-sky-300' // key
          } else {
            cls = 'text-emerald-300' // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-violet-400' // boolean
        } else if (/null/.test(match)) {
          cls = 'text-rose-400' // null
        }
        return `<span class="${cls}">${match}</span>`
      }
    )
}

export default function JsonParser() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const parse = useCallback((text, compact = false) => {
    const src = text !== undefined ? text : input
    if (!src.trim()) {
      setOutput('')
      setError('')
      return
    }
    try {
      const parsed = JSON.parse(src)
      const formatted = compact
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError('')
    } catch (e) {
      setError(e.message)
      setOutput('')
    }
  }, [input])

  const handleFormat = () => parse(input, false)
  const handleCompress = () => parse(input, true)

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">JSON 解析 / 格式化</h2>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="btn-primary" onClick={handleFormat}>
          <Maximize2 size={14} /> 格式化
        </button>
        <button className="btn-primary" onClick={handleCompress}>
          <Minimize2 size={14} /> 压缩
        </button>
        <button className="btn-secondary" onClick={handleCopy} disabled={!output}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? '已复制' : '复制'}
        </button>
        <button className="btn-secondary" onClick={handleClear}>
          <Trash2 size={14} /> 清空
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-mono">
          <span className="font-semibold">错误：</span>{error}
        </div>
      )}

      {/* Editor Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="glass-card p-4 flex flex-col">
          <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">输入</div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              parse(e.target.value, false)
            }}
            placeholder='在此粘贴 JSON 内容...'
            spellCheck={false}
            className="flex-1 min-h-80 bg-transparent text-slate-100 font-mono text-sm resize-none outline-none placeholder-slate-500"
          />
        </div>

        {/* Output */}
        <div className="glass-card p-4 flex flex-col">
          <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">输出</div>
          {output ? (
            <pre
              className="flex-1 min-h-80 font-mono text-sm text-slate-100 overflow-auto whitespace-pre-wrap break-all"
              dangerouslySetInnerHTML={{ __html: highlightJson(output) }}
            />
          ) : (
            <div className="flex-1 min-h-80 flex items-center justify-center text-slate-500 text-sm">
              格式化结果将显示在此处
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
