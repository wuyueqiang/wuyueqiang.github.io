import { useState, useRef, useCallback } from 'react'
import { Upload, Download, RefreshCw } from 'lucide-react'

const FORMATS = [
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
  { value: 'image/bmp', label: 'BMP', ext: 'bmp' },
]

function formatBytes(bytes) {
  if (!bytes) return '–'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function ImageConverter() {
  const [original, setOriginal] = useState(null) // { url, name, size }
  const [targetFormat, setTargetFormat] = useState('image/png')
  const [quality, setQuality] = useState(0.92)
  const [result, setResult] = useState(null) // { url, size, ext }
  const [converting, setConverting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setOriginal({ url, name: file.name, size: file.size })
    setResult(null)
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    loadFile(e.dataTransfer.files[0])
  }

  const convert = async () => {
    if (!original) return
    setConverting(true)
    try {
      const img = new Image()
      img.src = original.url
      await new Promise((res) => { img.onload = res })

      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      // Fill white background for formats that don't support transparency
      if (targetFormat === 'image/jpeg' || targetFormat === 'image/bmp') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)

      const q = targetFormat === 'image/jpeg' || targetFormat === 'image/webp' ? quality : undefined
      const dataUrl = canvas.toDataURL(targetFormat, q)

      // Calculate output size (base64 → bytes approx)
      const base64 = dataUrl.split(',')[1]
      const byteSize = Math.round(base64.length * 0.75)
      const fmt = FORMATS.find((f) => f.value === targetFormat)
      setResult({ url: dataUrl, size: byteSize, ext: fmt.ext })
    } finally {
      setConverting(false)
    }
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    const baseName = original.name.replace(/\.[^.]+$/, '')
    a.download = `${baseName}.${result.ext}`
    a.href = result.url
    a.click()
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">图片格式转换</h2>

      {/* Upload zone */}
      {!original && (
        <div
          className={`drop-zone ${dragging ? 'drop-zone-active' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-3 text-slate-400" size={36} />
          <p className="text-slate-300 font-medium">点击或拖拽图片到此处</p>
          <p className="text-slate-500 text-sm mt-1">支持 PNG、JPEG、WebP、GIF、BMP 等格式</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => loadFile(e.target.files[0])}
          />
        </div>
      )}

      {original && (
        <>
          {/* Controls */}
          <div className="glass-card p-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Format selector */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">目标格式：</span>
                <div className="flex gap-1">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setTargetFormat(f.value)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        targetFormat === f.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider (JPEG / WebP) */}
              {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">质量：</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.01"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-28 accent-indigo-500"
                  />
                  <span className="text-slate-300 text-sm w-10">{Math.round(quality * 100)}%</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 ml-auto">
                <button
                  className="btn-secondary"
                  onClick={() => { setOriginal(null); setResult(null) }}
                >
                  重新上传
                </button>
                <button className="btn-primary" onClick={convert} disabled={converting}>
                  <RefreshCw size={14} className={converting ? 'animate-spin' : ''} />
                  {converting ? '转换中…' : '开始转换'}
                </button>
                {result && (
                  <button className="btn-primary" onClick={download}>
                    <Download size={14} /> 下载
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                原图 · {formatBytes(original.size)}
              </div>
              <img src={original.url} alt="original" className="w-full object-contain max-h-80 rounded" />
            </div>
            <div className="glass-card p-4">
              <div className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                转换后{result ? ` · ${formatBytes(result.size)}` : ''}
              </div>
              {result ? (
                <img src={result.url} alt="converted" className="w-full object-contain max-h-80 rounded" />
              ) : (
                <div className="flex items-center justify-center max-h-80 h-48 text-slate-500 text-sm">
                  转换结果将在此处预览
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
