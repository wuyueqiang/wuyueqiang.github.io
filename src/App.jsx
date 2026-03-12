import { useState } from 'react'
import { Braces, ImageIcon, Minimize2 } from 'lucide-react'
import JsonParser from './components/JsonParser.jsx'
import ImageConverter from './components/ImageConverter.jsx'
import ImageCompressor from './components/ImageCompressor.jsx'

const TABS = [
  { id: 'json', label: 'JSON 解析', icon: Braces },
  { id: 'convert', label: '格式转换', icon: ImageIcon },
  { id: 'compress', label: '图片压缩', icon: Minimize2 },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('json')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
                T
              </div>
              <span className="font-semibold text-white text-lg hidden sm:block">wyq的工具箱</span>
            </div>

            {/* Tabs */}
            <nav className="flex gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'json' && <JsonParser />}
        {activeTab === 'convert' && <ImageConverter />}
        {activeTab === 'compress' && <ImageCompressor />}
      </main>
    </div>
  )
}
