import { useEffect, useState, type FormEvent } from 'react'
import type { AuthSession } from './authSession'

export type AuthMode = 'login' | 'register'

interface AuthModalProps {
  initialMode: AuthMode
  onClose: () => void
  onAuthenticate: (session: AuthSession) => void
}

function nameFromEmail(email: string) {
  return email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function AuthModal({ initialMode, onClose, onAuthenticate }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setMode(initialMode)
    setError('')
  }, [initialMode])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError('')
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Введите корректный email.')
      return
    }
    if (password.length < 6) {
      setError('Пароль должен состоять минимум из 6 символов.')
      return
    }
    if (mode === 'register' && name.trim().length < 2) {
      setError('Укажите имя — так мы сможем обращаться к вам.')
      return
    }
    onAuthenticate({ name: mode === 'register' ? name.trim() : nameFromEmail(email), email: email.trim().toLowerCase() })
  }

  return <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="auth-close" type="button" onClick={onClose} aria-label="Закрыть окно авторизации">×</button>
      <div className="auth-mark" aria-hidden="true">PH</div>
      <span className="overline">Price Hunter · личный кабинет</span>
      <h2 id="auth-title">{mode === 'login' ? 'Рады видеть снова' : 'Создайте аккаунт'}</h2>
      <p>{mode === 'login' ? 'Войдите, чтобы сохранять цели по цене и избранные предложения.' : 'Соберите избранное и уведомления в одном личном кабинете.'}</p>
      <div className="auth-tabs" role="tablist" aria-label="Выбор режима авторизации"><button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')}>Войти</button><button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => switchMode('register')}>Регистрация</button></div>
      <form onSubmit={submit} noValidate>
        {mode === 'register' && <label><span>Имя</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Как к вам обращаться" /></label>}
        <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" /></label>
        <label><span>Пароль</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Минимум 6 символов" /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit">{mode === 'login' ? 'Войти в аккаунт' : 'Создать аккаунт'}</button>
      </form>
      <small className="auth-demo-note">Пока это локальный демо-режим: пароль не отправляется и не сохраняется. Позже форма подключится к backend.</small>
    </section>
  </div>
}
