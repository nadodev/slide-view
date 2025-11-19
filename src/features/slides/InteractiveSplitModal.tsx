import React, { useCallback, useMemo, useState } from 'react';

type Part = { name: string; content: string };

type Props = {
  filename: string;
  content: string;
  onCancel: () => void;
  onConfirm: (parts: Part[]) => void;
};

export default function InteractiveSplitModal({ filename, content, onCancel, onConfirm }: Props) {
  const lines = useMemo(() => content.split(/\r?\n/), [content]);
  // splits is a set of line indexes AFTER which a split should occur
  const [splits, setSplits] = useState<number[]>(() => []);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [partsOverride, setPartsOverride] = useState<Record<number, string>>({});

  const toggleSplitAfter = useCallback((lineIndex: number) => {
    setSplits(prev => {
      const exists = prev.includes(lineIndex);
      if (exists) return prev.filter(i => i !== lineIndex).sort((a,b)=>a-b);
      return [...prev, lineIndex].sort((a,b)=>a-b);
    });
  }, []);

  const computedParts = useMemo(() => {
    const idxs = [...splits].sort((a, b) => a - b);
    const ranges: Array<[number, number]> = [];
    let start = 0;
    idxs.forEach((endIdx) => {
      ranges.push([start, endIdx]);
      start = endIdx + 1;
    });
    ranges.push([start, lines.length - 1]);

    return ranges.map(([s, e], i) => {
      const raw = lines.slice(s, e + 1).join('\n').trim();
      const override = partsOverride[i];
      return {
        name: `${filename.replace(/\.md$/i, '')}-${i + 1}`,
        content: (override !== undefined ? override : raw),
      } as Part;
    });
  }, [splits, lines, partsOverride, filename]);

  const mergeWithNext = (partIndex: number) => {
    setSplits(prev => {
      // to merge part i with i+1, we need to remove the split that ends part i (which is the split index equal to end of part i)
      const idxs = [...prev].sort((a,b)=>a-b);
      if (idxs.length === 0) return prev;
      // find the split that corresponds to end of partIndex
      // rebuild ranges to find which split corresponds
      const ranges: number[] = [];
      let start = 0;
      for (let s = 0; s < idxs.length; s++) {
        const endIdx = idxs[s];
        ranges.push(endIdx);
        start = endIdx + 1;
      }
      // If partIndex corresponds to last part, nothing to merge
      if (partIndex >= ranges.length) {
        // there is no split to remove (last part)
        return prev;
      }
      // remove the split at ranges[partIndex]
      const remove = ranges[partIndex];
      return prev.filter(i => i !== remove).sort((a,b)=>a-b);
    });
    // also clear any override for the next part to avoid confusion
    setPartsOverride(prev => {
      const copy = { ...prev };
      delete copy[partIndex + 1];
      return copy;
    });
  };

  const applyEditToPart = (idx: number, text: string) => {
    setPartsOverride(prev => ({ ...prev, [idx]: text }));
  };

  const handleConfirm = () => {
    const out = computedParts.map((p) => ({ name: p.name, content: p.content.trim() }));
    onConfirm(out);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="w-11/12 max-w-6xl bg-slate-900 rounded-lg p-4 text-slate-100 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Dividir arquivo: {filename}</h3>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-1 rounded bg-slate-700">Cancelar</button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500"
            >
              Confirmar ({computedParts.length} parts)
            </button>
          </div>
        </div>

        <div className="flex gap-4 h-[72vh]">
          <div className="flex-1 overflow-auto bg-slate-800 p-3 rounded border border-slate-700">
            <div className="text-sm text-slate-300 mb-2">Clique no marcador "⦿" ao lado de uma linha para adicionar/remover uma quebra após essa linha.</div>
            <div className="text-xs text-slate-400 mb-2">Linhas: {lines.length} • Divisões: {splits.length}</div>
            <div className="space-y-0 text-sm">
              {lines.map((ln, i) => {
                const isSplit = splits.includes(i);
                return (
                  <div key={i} className="flex items-start gap-2 py-1 border-b border-slate-800">
                    <button
                      title={isSplit ? 'Remover quebra após esta linha' : 'Adicionar quebra após esta linha'}
                      onClick={() => toggleSplitAfter(i)}
                      className={`w-7 h-7 flex items-center justify-center rounded ${isSplit ? 'bg-emerald-600 text-black' : 'bg-slate-700 text-slate-300'}`}
                    >
                      ⦿
                    </button>
                    <div className="flex-1 whitespace-pre-wrap text-slate-200 text-sm">{ln || ' '}</div>
                    <div className="w-12 text-right text-xs text-slate-400">{i + 1}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-96 overflow-auto bg-slate-800 p-3 rounded border border-slate-700">
            <div className="text-sm text-slate-300 mb-2">Partes geradas</div>
            <div className="space-y-3">
              {computedParts.map((p, idx) => (
                <div key={idx} className={`p-2 rounded border ${selectedPart === idx ? 'border-emerald-400' : 'border-slate-700'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="flex items-center gap-2">
                      <button className="text-xs px-2 py-1 bg-slate-700 rounded" onClick={() => setSelectedPart(idx)}>Editar</button>
                      <button className="text-xs px-2 py-1 bg-slate-700 rounded" onClick={() => mergeWithNext(idx)}>Mesclar com próxima</button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 max-h-28 overflow-auto whitespace-pre-wrap">{p.content || <span className="text-slate-500">(vazio)</span>}</div>
                </div>
              ))}
            </div>

            {selectedPart !== null && (
              <div className="mt-3">
                <div className="text-xs text-slate-300 mb-1">Editando: {computedParts[selectedPart]?.name}</div>
                <textarea
                  value={partsOverride[selectedPart] ?? computedParts[selectedPart]?.content ?? ''}
                  onChange={(e) => applyEditToPart(selectedPart, e.target.value)}
                  rows={8}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-100 resize-vertical"
                />
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 rounded bg-slate-700" onClick={() => setSelectedPart(null)}>Fechar</button>
                  <button className="px-3 py-1 rounded bg-emerald-600" onClick={() => setSelectedPart(null)}>Salvar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
