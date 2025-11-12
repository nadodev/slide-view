import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

export default function UploadArea({ onFilesChange, loading }) {
  const [splitSingle, setSplitSingle] = useState(false);
  const [delimiter, setDelimiter] = useState('----\'----');
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
      <h1>Apresentação de Slides</h1>
      <p>Envie os arquivos .md que representam os slides (serão ordenados por nome).</p>

      <label className="upload-area">
        <input ref={inputRef} type="file" multiple accept=".md" onChange={handleChange} aria-label="Selecionar arquivos markdown" />
        <Upload size={48} className="upload-icon" />
        <p className="upload-text-primary">Arraste ou selecione arquivos</p>
        <p className="upload-text-secondary">Selecione vários arquivos .md</p>
        <div style={{ height: 12 }} />
        <button type="button" className="upload-btn" onClick={openFilePicker}>Escolher arquivos</button>
      </label>

      <div className="upload-options">
        <label className="upload-checkbox">
          <input type="checkbox" checked={splitSingle} onChange={(e) => setSplitSingle(e.target.checked)} />
          <span>Dividir arquivo único em slides</span>
        </label>

        <label className="upload-delimiter">
          <span>Marcador:</span>
          <input 
            type="text" 
            value={delimiter} 
            onChange={(e) => setDelimiter(e.target.value)} 
            placeholder="----'----"
            aria-label="Marcador de separação de slides"
          />
        </label>
      </div>
      {localError && (
        <div role="status" aria-live="polite" className="upload-error">{localError}</div>
      )}
    </div>
  );
}
