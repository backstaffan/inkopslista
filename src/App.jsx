import { useState, useEffect, useRef } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'
import { categorize, CATEGORY_ORDER } from './categorize'
import './App.css'

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = user.displayName
    ? user.displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')
    : '?'

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-initials" onClick={() => setOpen((o) => !o)}>
        {initials}
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-name">{user.displayName}</div>
          <button className="user-dropdown-logout" onClick={onLogout}>Logga ut</button>
        </div>
      )}
    </div>
  )
}

const groupRadius = (idx, total) =>
  total === 1 ? 10 : idx === 0 ? '10px 10px 3px 3px' : idx === total - 1 ? '3px 3px 10px 10px' : 3

export default function App() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [checkedOpen, setCheckedOpen] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      const allowed = ['back.staffan@gmail.com', 'hannacbirgersson@gmail.com']
      if (u && !allowed.includes(u.email)) {
        signOut(auth)
        setLoading(false)
      } else {
        setUser(u)
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'items'), orderBy('createdAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsubscribe
  }, [user])

  const login = () => signInWithPopup(auth, googleProvider)
  const logout = () => signOut(auth)

  const addItem = async (e) => {
    e.preventDefault()
    const text = newItem.trim()
    if (!text) return
    setNewItem('')
    await addDoc(collection(db, 'items'), {
      text,
      checked: false,
      createdAt: serverTimestamp(),
      createdBy: user.displayName,
      category: await categorize(text),
    })
  }

  const toggleItem = (item) =>
    updateDoc(doc(db, 'items', item.id), {
      checked: !item.checked,
      checkedAt: !item.checked ? serverTimestamp() : null,
    })

  const formatCheckedAt = (ts) => {
    if (!ts) return ''
    const d = ts.toDate()
    return d.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })
  }

  const deleteItem = (id) => deleteDoc(doc(db, 'items', id))

  if (loading) return <div className="center">Laddar...</div>

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-top">
          <div className="login-subtitle">Hushållet</div>
          <h1>Inköpslistan</h1>
          <p>Logga in för att se och redigera listan</p>
        </div>
        <button className="btn-google" onClick={login}>
          Logga in med Google
        </button>
      </div>
    )
  }

  const unchecked = items.filter((i) => !i.checked)
  const checked = items
    .filter((i) => i.checked)
    .sort((a, b) => (b.checkedAt?.toMillis() ?? 0) - (a.checkedAt?.toMillis() ?? 0))

  const grouped = CATEGORY_ORDER
    .map((cat) => ({ cat, items: unchecked.filter((i) => (i.category || 'Övrigt') === cat) }))
    .filter(({ items }) => items.length > 0)

  const renderItem = (item, idx, total) => (
    <div
      key={item.id}
      className={`item${item.checked ? ' checked' : ''}`}
      style={{ borderRadius: groupRadius(idx, total) }}
    >
      <button className="check-btn" onClick={() => toggleItem(item)}>
        <span className={`circle${item.checked ? ' checked-circle' : ''}`}>
          {item.checked ? '✓' : ''}
        </span>
      </button>
      <span className="item-text">{item.text}</span>
      {item.checked
        ? <span className="item-by">{formatCheckedAt(item.checkedAt)}</span>
        : <span className="item-by">{item.createdBy?.split(' ')[0]}</span>
      }
      <button className="delete-btn" onClick={() => deleteItem(item.id)}>&#x2715;</button>
    </div>
  )

  return (
    <div className="app">
      <header>
        <div>
          <div className="header-subtitle">Hushållet</div>
          <h1>Inköpslistan</h1>
        </div>
        <UserMenu user={user} onLogout={logout} />
      </header>

      <main>
        <form onSubmit={addItem} className="add-form">
          <input
            type="text"
            placeholder="Lägg till vara..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            autoFocus
          />
          <button type="submit" className={`btn-add${newItem.trim() ? ' active' : ''}`}>
            Lägg till
          </button>
        </form>

        {grouped.map(({ cat, items: catItems }) => (
          <div key={cat} className="category-group">
            <p className="category-label">{cat}</p>
            <div className="item-group">
              {catItems.map((item, idx) => renderItem(item, idx, catItems.length))}
            </div>
          </div>
        ))}

        {checked.length > 0 && (
          <>
            <button className="checked-header" onClick={() => setCheckedOpen((o) => !o)}>
              <span className={`toggle-triangle${checkedOpen ? ' open' : ''}`}>▶</span>
              Klart ({checked.length})
            </button>
            {checkedOpen && (
              <div className="item-group checked-group">
                {checked.map((item, idx) => renderItem(item, idx, checked.length))}
              </div>
            )}
          </>
        )}

        {items.length === 0 && (
          <p className="empty">Listan är tom. Lägg till någonting!</p>
        )}
      </main>
    </div>
  )
}
