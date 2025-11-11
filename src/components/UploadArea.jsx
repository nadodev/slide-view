import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

export default function UploadArea({ onFilesChange, loading }) {
  const [splitSingle, setSplitSingle] = useState(false);
  const [delimiter, setDelimiter] = useState('---');
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    const invalid = files.find((f) => !/\.md$/i.test(f.name));
    if (invalid) {
      const msg = `Arquivo inválido: ${invalid.name}. Apenas .md é permitido.`;
      setLocalError(msg);
      if (typeof onFilesChange === 'function') onFilesChange(null, { error: msg });
      return;
    }
    setLocalError('');
    if (typeof onFilesChange === 'function') onFilesChange(e, { splitSingle, delimiter });
  };
  const inputRef = useRef(null);

  const openFilePicker = () => {
    if (inputRef.current) inputRef.current.click();
  };

  return (
    <div className="upload-screen">
      <h1>Aprensetação de slides</h1>
      <p>Envie os arquivos .md que representam os slides (serão ordenados por nome).</p>

      <label className="upload-area">
        <input ref={inputRef} type="file" multiple accept=".md" onChange={handleChange} aria-label="Selecionar arquivos markdown" />
        <Upload size={48} className="upload-icon" />
        <p className="upload-text-primary">Arraste ou selecione arquivos</p>
        <p className="upload-text-secondary">Selecione vários arquivos .md</p>
        <div style={{ height: 12 }} />
        <button type="button" className="upload-btn" onClick={openFilePicker}>Escolher arquivos</button>
      </label>

      <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={splitSingle} onChange={(e) => setSplitSingle(e.target.checked)} />
          <span style={{ fontSize: 14 }}>Dividir arquivo único em slides</span>
        </label>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14 }}>Marcador:</span>
          <input value={delimiter} onChange={(e) => setDelimiter(e.target.value)} style={{ padding: '6px 8px', borderRadius: 6 }} />
        </label>
      </div>
      {localError && (
        <div role="status" aria-live="polite" style={{ marginTop: 10, color: '#c62828', background: '#fff1f2', padding: 8, borderRadius: 6 }}>{localError}</div>
      )}
    </div>
  );
}
