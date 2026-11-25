import { useEffect, useRef, useState } from 'react';
import { BeltRow, getTechniquesForItem, T } from '../data/graduation';

interface TechniqueSheetProps {
  row: BeltRow | null;
  onClose: () => void;
}

export function TechniqueSheet({ row, onClose }: TechniqueSheetProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!row) return;
    setTabIndex(0);
    closeBtnRef.current?.focus();
    if (sheetRef.current) {
      sheetRef.current.scrollTop = 0;
    }
  }, [row]);

  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.scrollTop = 0;
    }
  }, [tabIndex]);

  useEffect(() => {
    if (!row) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [row, onClose]);

  const techniques = row ? getTechniquesForItem(row[3], row[4]) : [];
  const active = techniques[tabIndex] ?? techniques[0];
  const tech = active ? T[active.k] : null;

  return (
    <div
      className={`ov ${row ? 'on' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet" ref={sheetRef}>
        <div className="sh">
          <div>
            <div className="cat">{row ? `${row[3]} · item ${row[2]}` : ''}</div>
            <h3 id="shTitle">{row ? row[4] : ''}</h3>
          </div>
          <button
            ref={closeBtnRef}
            className="x"
            type="button"
            aria-label="Fechar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="tabs">
          {techniques.length > 1 &&
            techniques.map((item, j) => (
              <button
                key={`${item.k}-${j}`}
                type="button"
                className="chip"
                aria-pressed={j === tabIndex}
                onClick={() => setTabIndex(j)}
              >
                {T[item.k].t}
              </button>
            ))}
        </div>

        {tech && active && (
          <div className="tq">
            <h4>
              {tech.t}
              {active.sug && <span className="tag">Sugestão</span>}
              {tech.tag && <span className="tag">{tech.tag}</span>}
            </h4>
            <p className="pos">Posição de partida: {tech.p}</p>
            <ol className="steps">
              {tech.s.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
            <div className="tip">
              <div>
                <b>Detalhe que faz funcionar</b>
                {tech.d}
              </div>
              <div>
                <b>Erro comum</b>
                {tech.e}
              </div>
            </div>
            {tech.w && <p className="warn">⚠ {tech.w}</p>}
            {active.sug && (
              <p className="pos pos-note">
                Item livre: esta é uma sugestão. Você pode apresentar outra técnica da mesma categoria.
              </p>
            )}
            <div className="media">
              <h5>Vídeos de apoio</h5>
              <div className="links">
                <a
                  className="lk yt"
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${tech.t} jiu jitsu passo a passo`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>▶ Procurar vídeos de &ldquo;{tech.t}&rdquo; no YouTube</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
