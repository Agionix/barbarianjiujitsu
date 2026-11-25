import { FormEvent, useState } from 'react';
import logoUrl from '../assets/barbarian-login-logo.png';
import { authenticateStudent, AuthStudent } from '../data/students';

interface LoginScreenProps {
  onSuccess: (student: AuthStudent) => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');
  const [errorReason, setErrorReason] = useState<'invalid' | 'blocked' | null>(null);
  const [noticeKey, setNoticeKey] = useState(0);

  const clearError = () => {
    if (error) {
      setError('');
      setErrorReason(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = authenticateStudent(codigo, nome);
    if (!res.ok) {
      setError(res.error);
      setErrorReason(res.reason);
      setNoticeKey((k) => k + 1);
      return;
    }
    setError('');
    setErrorReason(null);
    onSuccess(res.student);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img
            src={logoUrl}
            alt="Barbarian Jiu Jitsu & Defesa Pessoal"
            className="login-logo"
            draggable={false}
          />
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h1 className="login-title">Login</h1>
          <div className="field">
            <label htmlFor="login-code">Código do aluno</label>
            <div className="code-row">
              <input
                id="login-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                placeholder="Ex: 672"
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.replace(/\D/g, ''));
                  clearError();
                }}
              />
              <button
                type="button"
                className="help-btn"
                aria-expanded={showHelp}
                aria-controls="code-help-box"
                aria-label="Onde ver o código?"
                title="Onde ver o código?"
                onClick={() => setShowHelp((v) => !v)}
              >
                <span className="help-glyph" aria-hidden="true">
                  {showHelp ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
                    </svg>
                  )}
                </span>
              </button>
            </div>

            <div
              id="code-help-box"
              className={`help-collapse ${showHelp ? 'open' : ''}`}
              aria-hidden={!showHelp}
            >
              <div className="help-collapse-inner">
                <div className="help-box" role="note">
                  <b>Onde ver o seu código?</b>
                  <p>
                    O código fica no seu <strong>perfil da Tecnofit</strong>. Abra o aplicativo da
                    Tecnofit, entre no seu perfil e confira o número exibido junto aos seus dados.
                  </p>
                  <a
                    className="help-link"
                    href="https://www.tecnofit.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={showHelp ? 0 : -1}
                  >
                    Acessar Tecnofit ↗
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="login-name">Nome</label>
            <input
              id="login-name"
              type="text"
              autoComplete="name"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                clearError();
              }}
            />
          </div>

          {error && errorReason === 'blocked' && (
            <div key={noticeKey} className="login-blocked-alert" role="alert">
              <span className="login-blocked-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
              <div className="login-blocked-copy">
                <strong>Acesso bloqueado</strong>
                <p>
                  Seu cadastro consta como bloqueado na Tecnofit. Entre em{' '}
                  <a
                    className="login-whatsapp-link"
                    href="https://wa.me/5519987812012"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    contato
                  </a>{' '}
                  com a academia para regularizar e liberar seu acesso.
                </p>
              </div>
            </div>
          )}

          {error && errorReason !== 'blocked' && (
            <p key={noticeKey} className="login-err" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login-submit">
            Entrar
          </button>
        </form>
      </div>
      <footer className="login-foot">
        Barbarian Jiu Jitsu &amp; Defesa Pessoal · Acesso do aluno
      </footer>
    </div>
  );
}
