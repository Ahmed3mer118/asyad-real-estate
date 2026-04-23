import { useState, useEffect, useCallback, useRef } from 'react';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

const newKey = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const slotFromApi = (img, i) => {
  const url = typeof img === 'string' ? img : img?.url || img?.path || '';
  const id = typeof img === 'object' ? img._id || img.id : null;
  return {
    key: id ? String(id) : `slot-${i}-${url.slice(-24)}`,
    _id: id || undefined,
    url,
    file: null,
    objectUrl: null,
  };
};

const mergeFiles = (fileList) =>
  Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));

const DropShell = ({ children, onFiles, label, className = '' }) => {
  const [over, setOver] = useState(false);
  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    const fromFs = mergeFiles(e.dataTransfer?.files);
    if (fromFs.length) onFiles(fromFs);
  };
  return (
    <div
      role="presentation"
      onDragEnter={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget)) setOver(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`relative rounded-2xl border-2 border-dashed transition-colors ${over ? 'border-blue bg-blue/5' : 'border-slate-200 bg-slate-50/50'} ${className}`}
    >
      {children}
      <p className="text-center text-[11px] font-bold text-slate-400 pb-2 px-2">{label}</p>
    </div>
  );
};

/**
 * Cover image + reorderable gallery; device upload + drag & drop files; drag rows to reorder gallery.
 */
const PropertyImageManager = ({ property, onDraftChange }) => {
  const [main, setMain] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [dragIdx, setDragIdx] = useState(null);
  const fileMainRef = useRef(null);
  const fileGalleryRef = useRef(null);
  const mainRef = useRef(null);
  mainRef.current = main;

  useEffect(() => {
    if (!property?.images?.length) {
      setMain(null);
      setGallery([]);
      return;
    }
    const imgs = property.images;
    const mainImg = imgs.find((x) => x?.isMain) || imgs[0];
    const rest = imgs.filter((x) => x !== mainImg);
    setMain(mainImg ? slotFromApi(mainImg, 0) : null);
    setGallery(rest.map((x, i) => slotFromApi(x, i + 1)));
  }, [property?.id]);

  useEffect(() => {
    onDraftChange?.({ main, gallery });
  }, [main, gallery, onDraftChange]);

  const preview = (slot) => slot?.objectUrl || slot?.url || null;

  const revokeSlot = (slot) => {
    if (slot?.objectUrl) {
      try {
        URL.revokeObjectURL(slot.objectUrl);
      } catch {
        /* noop */
      }
    }
  };

  const pushGallery = useCallback((files) => {
    setGallery((g) => [
      ...g,
      ...files.map((file) => ({
        key: newKey(),
        url: '',
        file,
        objectUrl: URL.createObjectURL(file),
        _id: undefined,
      })),
    ]);
  }, []);

  const handlePickMain = (files) => {
    const list = mergeFiles(files);
    if (!list.length) return;
    const f = list[0];
    const objectUrl = URL.createObjectURL(f);
    setMain((prev) => {
      revokeSlot(prev);
      return { key: newKey(), url: '', file: f, objectUrl, _id: undefined };
    });
    if (list.length > 1) pushGallery(list.slice(1));
  };

  const handlePickGallery = (files) => {
    const list = mergeFiles(files);
    if (!list.length) return;
    pushGallery(list);
  };

  const removeMain = () => {
    setMain((prev) => {
      revokeSlot(prev);
      return null;
    });
  };

  const removeGalleryAt = (idx) => {
    setGallery((g) => {
      const next = [...g];
      const [removed] = next.splice(idx, 1);
      revokeSlot(removed);
      return next;
    });
  };

  const promoteToMain = (idx) => {
    const prevMain = mainRef.current;
    setGallery((g) => {
      const next = [...g];
      const [chosen] = next.splice(idx, 1);
      if (!chosen) return g;
      const oldBack =
        prevMain && (prevMain.url || prevMain.file)
          ? [
              {
                ...prevMain,
                key: newKey(),
                file: prevMain.file,
                objectUrl: prevMain.objectUrl,
                url: prevMain.url,
                _id: prevMain._id,
              },
            ]
          : [];
      setMain(chosen ? { ...chosen, key: newKey() } : null);
      return [...oldBack, ...next];
    });
  };

  const moveGallery = (from, to) => {
    if (from === to || from == null || to == null) return;
    setGallery((g) => {
      const next = [...g];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });
  };

  const mainPreview = preview(main);

  return (
    <div className="space-y-5 sm:col-span-2">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Cover image</p>
        <DropShell onFiles={handlePickMain} label="Drop an image here or use Browse">
          <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-44 aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
              {mainPreview ? (
                <img src={mainPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-slate-300">🖼</span>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1 w-full">
              <input
                ref={fileMainRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => {
                  handlePickMain(e.target.files);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                className="text-sm font-bold text-blue hover:underline text-left"
                onClick={() => fileMainRef.current?.click()}
              >
                Browse files
              </button>
              {main && (
                <button type="button" className="text-xs font-bold text-rose-500 hover:underline text-left" onClick={removeMain}>
                  Remove cover
                </button>
              )}
            </div>
          </div>
        </DropShell>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Gallery (drag rows to reorder)</p>
        <DropShell onFiles={handlePickGallery} label="Drop more images to add to the gallery" className="p-2">
          <input
            ref={fileGalleryRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              handlePickGallery(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="flex justify-end px-2 pt-1">
            <button
              type="button"
              className="text-xs font-bold text-blue hover:underline"
              onClick={() => fileGalleryRef.current?.click()}
            >
              + Add images
            </button>
          </div>
          {gallery.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">No extra photos yet</p>
          ) : (
            <ul className="divide-y divide-slate-100 px-1">
              {gallery.map((slot, idx) => {
                const src = preview(slot);
                return (
                  <li
                    key={slot.key}
                    draggable
                    onDragStart={() => setDragIdx(idx)}
                    onDragEnd={() => setDragIdx(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIdx != null && dragIdx !== idx) moveGallery(dragIdx, idx);
                      setDragIdx(null);
                    }}
                    className={`flex items-center gap-3 py-3 cursor-grab active:cursor-grabbing ${dragIdx === idx ? 'opacity-50' : ''}`}
                  >
                    <span className="text-slate-300 select-none" title="Drag to reorder">
                      ⠿
                    </span>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                      {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-600 truncate">{slot.file?.name || slot.url || 'Image'}</p>
                      <p className="text-[10px] text-slate-400">{slot._id ? `id: ${slot._id}` : 'New upload'}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" className="text-[11px] font-bold text-blue whitespace-nowrap" onClick={() => promoteToMain(idx)}>
                        Set as cover
                      </button>
                      <button type="button" className="text-[11px] font-bold text-rose-500" onClick={() => removeGalleryAt(idx)}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </DropShell>
      </div>
    </div>
  );
};

export default PropertyImageManager;
