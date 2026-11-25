import { useEffect, useMemo, useRef, useState } from 'react';
import logoUrl from './assets/barbarian-logo.jpg';
import { BeltSvg } from './components/BeltSvg';
import { LoginScreen } from './components/LoginScreen';
import { TechniqueSheet } from './components/TechniqueSheet';
import { BELTS, D, getBeltColor, GR, NEXT } from './data/graduation';
import { AuthStudent, isStudentBlocked, STUDENTS } from './data/students';

interface SelectionState {
  f: string;
  g: string;
}

type DoneMap = Record<string, 1>;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota/privacy mode errors
  }
}

function readStoredAuth(): AuthStudent | null {
  const saved = readStorage<AuthStudent | null>('bbn-auth', null);
  if (!saved || typeof saved.codigo !== 'number') return null;
  if (saved.codigo === 1 && saved.role === 'admin') {
    return { codigo: 1, nome: 'Administrador', role: 'admin' };
  }
  if (isStudentBlocked(saved.codigo)) {
    try {
      localStorage.removeItem('bbn-auth');
    } catch {
      // Ignore storage errors
    }
    return null;
  }
  const exists = STUDENTS.some(([codigo]) => codigo === saved.codigo);
  return exists ? saved : null;
}

export default function App() {
  const [student, setStudent] = useState<AuthStudent | null>(() => readStoredAuth());
  const [sel, setSel] = useState<SelectionState>(() =>
    readStorage<SelectionState>('bbn-sel', { f: 'Branca', g: '1º grau' }),
  );
  const [done, setDone] = useState<DoneMap>(() => readStorage<DoneMap>('bbn-done', {}));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const gradesOfBelt = useMemo(
    () => [...new Set(D.filter((r) => r[0] === sel.f).map((r) => r[1]))],
    [sel.f],
  );

  const activeGrade = useMemo(() => {
    if (gradesOfBelt.includes(sel.g)) return sel.g;
    return gradesOfBelt[gradesOfBelt.length - 2] || gradesOfBelt[0] || '1º grau';
  }, [gradesOfBelt, sel.g]);

  useEffect(() => {
    if (activeGrade !== sel.g) {
      const next = { f: sel.f, g: activeGrade };
      setSel(next);
      writeStorage('bbn-sel', next);
    } else {
      writeStorage('bbn-sel', sel);
    }
  }, [activeGrade, sel]);

  const maxGrades = useMemo(
    () => gradesOfBelt.filter((g) => g !== 'Troca de faixa').length,
    [gradesOfBelt],
  );

  const rows = useMemo(
    () =>
      D.filter((r) => r[0] === sel.f && r[1] === activeGrade).sort((a, b) => a[2] - b[2]),
    [sel.f, activeGrade],
  );

  const troca = activeGrade === 'Troca de faixa';
  const nextBelt = NEXT[sel.f];
  const currentGradeNum = parseInt(activeGrade, 10) || 0;

  const doneCount = useMemo(
    () => rows.filter((r) => Boolean(done[r.slice(0, 3).join('|')])).length,
    [rows, done],
  );
  const progressPct = rows.length ? (doneCount / rows.length) * 100 : 0;

  const handleSelectBelt = (belt: string) => {
    const gs = [...new Set(D.filter((r) => r[0] === belt).map((r) => r[1]))];
    const nextGrade = gs.includes(activeGrade)
      ? activeGrade
      : gs[gs.length - 2] || gs[0] || '1º grau';
    setSel({ f: belt, g: nextGrade });
  };

  const handleSelectGrade = (grade: string) => {
    if (!gradesOfBelt.includes(grade)) return;
    setSel({ f: sel.f, g: grade });
  };

  const toggleDone = (id: string, checked: boolean) => {
    setDone((prev) => {
      const next = { ...prev };
      if (checked) {
        next[id] = 1;
      } else {
        delete next[id];
      }
      writeStorage('bbn-done', next);
      return next;
    });
  };

  const handleOpenItem = (index: number, trigger: HTMLElement) => {
    lastFocusedRef.current = trigger;
    setOpenIndex(index);
  };

  const handleCloseSheet = () => {
    setOpenIndex(null);
    lastFocusedRef.current?.focus();
  };

  const openRow = openIndex !== null ? (rows[openIndex] ?? null) : null;

  const handleLoginSuccess = (authStudent: AuthStudent) => {
    writeStorage('bbn-auth', authStudent);
    setStudent(authStudent);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('bbn-auth');
    } catch {
      // Ignore storage errors
    }
    setOpenIndex(null);
    setStudent(null);
  };

  if (!student) {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      <header className="band">
        <div className="wrap brand">
          <img
            src={logoUrl}
            alt="Barbarian Jiu Jitsu & Defesa Pessoal"
            className="logo"
            width={420}
            height={420}
            draggable={false}
          />
          <h1>
            Guia de graduação
            <span>Selecione sua faixa atual e o exame que vai fazer</span>
          </h1>
        </div>
        <div className="wrap userbar">
          {student.role === 'admin' ? (
            <span>
              <strong>Administrador</strong> · Código <strong>{student.codigo}</strong>
            </span>
          ) : (
            <span>
              Aluno: <strong>{student.nome}</strong> · Código <strong>{student.codigo}</strong>
            </span>
          )}
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>
        <div className="stage">
          <div className="wrap">
            <div className="beltbox" key={`${sel.f}-${activeGrade}`}>
              {troca && nextBelt ? (
                <>
                  <div className="belt-prev">
                    <BeltSvg
                      color={getBeltColor(sel.f)}
                      graus={maxGrades}
                      max={maxGrades}
                      small
                    />
                  </div>
                  <div className="arrow">▼ troca de faixa</div>
                  <BeltSvg color={nextBelt[1]} graus={0} max={4} />
                </>
              ) : (
                <BeltSvg
                  color={getBeltColor(sel.f)}
                  graus={currentGradeNum}
                  max={maxGrades}
                />
              )}
            </div>
            <div className="cap">
              <b>
                {troca && nextBelt
                  ? `${sel.f} → ${nextBelt[0]}${sel.f === 'Branca' ? ' (adulto)' : ''}`
                  : `Faixa ${sel.f} · ${currentGradeNum} ${currentGradeNum > 1 ? 'graus' : 'grau'}`}
              </b>
              <span className="t">
                {rows.length ? `Tempo máximo proposto: ${rows[0][5]} min` : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="band ctl">
        <div className="wrap">
          <p className="lab" id="lf">
            Faixa atual
          </p>
          <div className="chips" role="group" aria-labelledby="lf">
            {BELTS.map(([belt, hex]) => (
              <button
                key={belt}
                type="button"
                className="chip"
                aria-pressed={belt === sel.f}
                onClick={() => handleSelectBelt(belt)}
              >
                <i style={{ background: hex }} />
                {belt}
              </button>
            ))}
          </div>
          <p className="lab" id="lg">
            Exame pretendido
          </p>
          <div className="chips" role="group" aria-labelledby="lg">
            {GR.map((grade) => {
              const available = gradesOfBelt.includes(grade);
              return (
                <button
                  key={grade}
                  type="button"
                  className="chip"
                  aria-pressed={grade === activeGrade}
                  disabled={!available}
                  onClick={() => handleSelectGrade(grade)}
                >
                  {grade}
                </button>
              );
            })}
          </div>
          <p className="msg">
            {maxGrades < 4 ? `Faixa ${sel.f} (teens) tem somente ${maxGrades} graus.` : ''}
          </p>
        </div>
      </section>

      <main className="band">
        <div className="wrap">
          <div className="head">
            <h2>
              {troca
                ? `Exame de troca de faixa — ${sel.f}`
                : `Exame de ${activeGrade} — faixa ${sel.f}`}
            </h2>
            <span className="prog">
              {doneCount} de {rows.length} treinados
            </span>
          </div>
          <div className="bar">
            <div style={{ width: `${progressPct}%` }} />
          </div>
          <div className="list">
            {rows.map((r, i) => {
              const id = r.slice(0, 3).join('|');
              const ok = Boolean(done[id]);
              return (
                <div key={id} className={`card ${ok ? 'done' : ''}`}>
                  <button
                    type="button"
                    className="item"
                    onClick={(e) => handleOpenItem(i, e.currentTarget)}
                  >
                    <span className="n">{r[2]}</span>
                    <span className="cat">{r[3]}</span>
                    <span className="req">{r[4]}</span>
                    <span className="go">Ver passo a passo →</span>
                  </button>
                  <label className="ck" title="Marcar como treinado">
                    <input
                      type="checkbox"
                      checked={ok}
                      aria-label="Treinado"
                      onChange={(e) => toggleDone(id, e.target.checked)}
                    />
                  </label>
                </div>
              );
            })}
          </div>
          <p className="note">
            Treine com supervisão. Respeite as restrições de idade e faixa; técnicas avançadas
            devem ser demonstradas sem pressão excessiva. Toque em cada item para ver o passo a
            passo de referência; quando o item for livre, mostramos uma sugestão — o professor
            pode aceitar outras técnicas.
          </p>
        </div>
      </main>

      <footer>
        Barbarian Jiu Jitsu &amp; Defesa Pessoal · Matriz de graduação · cores das faixas
        conforme sistema IBJJF
      </footer>

      <TechniqueSheet row={openRow} onClose={handleCloseSheet} />
    </>
  );
}
