import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sq_debug_log'
const MAX_ENTRIES = 50

type Entry = { t: string; msg: string }

function read(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Entry[]) : []
  } catch {
    return []
  }
}

function write(entries: Entry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)))
  } catch {
    // ignore
  }
}

export function debugLog(msg: string) {
  const entries = read()
  entries.push({ t: new Date().toISOString().substring(11, 19), msg })
  write(entries)
  globalThis.dispatchEvent(new CustomEvent('sq:debug'))
  // eslint-disable-next-line no-console
  console.log('[DBG]', msg)
}

export function debugClear() {
  write([])
  globalThis.dispatchEvent(new CustomEvent('sq:debug'))
}

export function DebugLog() {
  const [entries, setEntries] = useState<Entry[]>(() => read())
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const handler = () => setEntries(read())
    globalThis.addEventListener('sq:debug', handler)
    return () => globalThis.removeEventListener('sq:debug', handler)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: 11,
        maxHeight: open ? '40vh' : 28,
        overflow: 'auto',
        borderTop: '2px solid #9146FF',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: 4,
          background: '#9146FF',
          color: '#fff',
          fontSize: 12,
          position: 'sticky',
          top: 0,
        }}
      >
        <button onClick={() => setOpen(!open)} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '2px 8px' }}>
          {open ? 'Hide' : 'Show'} debug ({entries.length})
        </button>
        <button onClick={debugClear} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '2px 8px' }}>
          Clear
        </button>
      </div>
      {open && (
        <div style={{ padding: 6 }}>
          {entries.length === 0 && <div style={{ color: '#888' }}>(no events yet)</div>}
          {entries.map((e, i) => (
            <div key={i} style={{ borderBottom: '1px solid #333', padding: '2px 0', wordBreak: 'break-all' }}>
              <span style={{ color: '#888' }}>{e.t}</span> — {e.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
