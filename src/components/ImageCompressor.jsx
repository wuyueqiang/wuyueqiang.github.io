import { useState, useRef, useCallback } from 'react'
import { Upload, Download } from 'lucide-react'
import imageCompression from 'browser-image-compression'

function formatBytes(bytes) {
  if (!bytes) return '–'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function ImageCompressor() {
  const [original, setOriginal] = useState(null) // { file, url, size }
  const [quality, setQuality] = useState(80)
  const [result, setResult] = useState(null) // { url, size, file }
  const [compressing, setCompressing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setOriginal({ file, url, size: file.size })
    setResult(null)
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    loadFile(e.dataTransfer.files[0])
  }

  const compress = async () => {
    if (!original) return
    setCompressing(true)
    try {
      const options = {
        maxSizeMB: 100,
        initialQuality: quality / 100,
        useWebWorker: true,
        onProgress: () => {},
      }
      const compressed = await imageCompression(original.file, options)
      const url = URL.createObjectURL(compressed)
      setResult({ url, size: compressed.size, file: compressed })
    } catch (e) {
      console.error(e)
    } finally {
      setCompressing(false)
    }
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = `compressed_${original.file.name}`
    a.click()
  }

  const ratio = result
    ? Math.round((1 - result.size / original.size) * 100)
    : null

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">图片压缩</h2>

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
          <p className="text-slate-500 text-sm mt-1">支持 PNG、JPEG、WebP 等格式</p>
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
              <div className="flex items-center gap-3 flex-1">
                <span className="text-slate-400 text-sm shrink-0">压缩质量：</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={quality}
                  onChange={(e) => { setQuality(Number(e.target.value)); setResult(null) }}
                  className="flex-1 max-w-xs accent-indigo-500"
                />
                <span className="text-white font-semibold text-sm w-10">{quality}%</span>
              </div>

              <div className="flex gap-2 ml-auto">
                <button className="btn-secondary" onClick={() => { setOriginal(null); setResult(null) }}>
                  重新上传
                </button>
                <button className="btn-primary" onClick={compress} disabled={compressing}>
                  {compressing ? '压缩中…' : '开始压缩'}
                </button>
                {result && (
                  <button className="btn-primary" onClick={download}>
                    <Download size={14} /> 下载
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            {result && (
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-xs mb-1">原始大小</div>
                  <div className="text-white font-semibold">{formatBytes(original.size)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">压缩后大小</div>
                  <div className="text-emerald-400 font-semibold">{formatBytes(result.size)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs mb-1">压缩率</div>
                  <div className={`font-semibold ${ratio > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {ratio > 0 ? `↓ ${ratio}%` : `↑ ${Math.abs(ratio)}%`}
                  </div>
                </div>
              </div>
            )}
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
                压缩后{result ? ` · ${formatBytes(result.size)}` : ''}
              </div>
              {result ? (
                <img src={result.url} alt="compressed" className="w-full object-contain max-h-80 rounded" />
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                  压缩结果将在此处预览
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
