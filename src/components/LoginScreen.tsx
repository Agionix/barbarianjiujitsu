import { FormEvent, useMemo, useState } from 'react';
import logoUrl from '../assets/barbarian-login-logo.png';
import { authenticateStudent, AuthStudent } from '../data/students';

interface LoginScreenProps {
  onSuccess: (student: AuthStudent) => void;
}

const TECNOFIT_WEB_URL = 'https://www.tecnofit.com.br';
const TECNOFIT_IOS_APP_URL = 'https://apps.apple.com/br/app/tecnofit/id1109478634';
const TECNOFIT_ANDROID_INTENT_URL =
  'intent://#Intent;scheme=tecnofit;package=br.com.tecnofit.mobileapp;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dbr.com.tecnofit.mobileapp;end';

function getTecnofitLinkProps(): {
  href: string;
  target?: '_blank';
  rel?: 'noopener noreferrer';
} {
  if (typeof navigator === 'undefined') {
    return { href: TECNOFIT_WEB_URL, target: '_blank', rel: 'noopener noreferrer' };
  }

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);

  if (isAndroid) {
    return { href: TECNOFIT_ANDROID_INTENT_URL };
  }
  if (isIOS) {
    return { href: TECNOFIT_IOS_APP_URL, target: '_blank', rel: 'noopener noreferrer' };
  }
  return { href: TECNOFIT_WEB_URL, target: '_blank', rel: 'noopener noreferrer' };
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');
  const [noticeKey, setNoticeKey] = useState(0);
  const tecnofitLink = useMemo(() => getTecnofitLinkProps(), []);

  const clearError = () => {
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = authenticateStudent(codigo, nome);
    if (!res.ok) {
      setError(res.error);
      setNoticeKey((k) => k + 1);
      return;
    }
    setError('');
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
                    href={tecnofitLink.href}
                    target={tecnofitLink.target}
                    rel={tecnofitLink.rel}
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

          {error && (
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
