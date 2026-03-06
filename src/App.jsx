import { useState, useEffect } from 'react'
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

export default function App() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
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
      category: categorize(text),
    })
  }

  const toggleItem = (item) =>
    updateDoc(doc(db, 'items', item.id), { checked: !item.checked })

  const deleteItem = (id) => deleteDoc(doc(db, 'items', id))

  if (loading) return <div className="center">Laddar...</div>

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-top">
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
  const checked = items.filter((i) => i.checked)

  const grouped = CATEGORY_ORDER
    .map((cat) => ({ cat, items: unchecked.filter((i) => (i.category || 'Övrigt') === cat) }))
    .filter(({ items }) => items.length > 0)

  const renderItem = (item) => (
    <li key={item.id} className={`item${item.checked ? ' checked' : ''}`}>
      <button className="check-btn" onClick={() => toggleItem(item)}>
        <span className={`circle${item.checked ? ' checked-circle' : ''}`}>
          {item.checked ? '✓' : ''}
        </span>
      </button>
      <span className="item-text">{item.text}</span>
      {!item.checked && <span className="item-by">{item.createdBy}</span>}
      <button className="delete-btn" onClick={() => deleteItem(item.id)}>&#x2715;</button>
    </li>
  )

  return (
    <div className="app">
      <header>
        <h1>Inköpslistan</h1>
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
          <button type="submit" className="btn-add">+</button>
        </form>

        {grouped.map(({ cat, items: catItems }) => (
          <div key={cat}>
            <p className="category-label">{cat}</p>
            <ul className="list">
              {catItems.map(renderItem)}
            </ul>
          </div>
        ))}

        {checked.length > 0 && (
          <>
            <p className="checked-label">Klart ({checked.length})</p>
            <ul className="list checked-list">
              {checked.map(renderItem)}
            </ul>
          </>
        )}

        {items.length === 0 && (
          <p className="empty">Listan är tom. Lägg till någonting!</p>
        )}
      </main>

      <footer className="user-footer">
        <img src={user.photoURL} alt="" className="avatar" />
        <span>{user.displayName}</span>
        <button className="btn-logout" onClick={logout}>Logga ut</button>
      </footer>
    </div>
  )
}
