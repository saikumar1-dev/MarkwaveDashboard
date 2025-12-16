import React, { useEffect, useRef, useState } from "react";

/**
 * BuffaloManager.jsx
 *
 * Behavior:
 * - Try API at API_BASE (GET). If successful, use API for CRUD.
 * - If API unreachable, fallback to public/buffaloData.json (expects object with "buffaloDetails" array).
 * - No localStorage usage (per your request) — fallback mode is memory-only.
 * - Images are stored as data URLs in each buffalo object's `images` array.
 */

const API_BASE = "https://markwavedb.onrender.com/buffaloDetails";
// const FALLBACK_JSON = `${import.meta?.env?.BASE_URL ?? "/"}buffaloData.json`; // works with Vite/CRA
const DEFAULT_INSURANCE = 13000;
const DESC_MAX = 250;

export default function BuffaloManager({apiStatus}) {
  const [buffalos, setBuffalos] = useState([]); // canonical list used in UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    price: "",
    description: "",
    age: "",
    location: "",
    inStock: true,
    images: [], // data URLs here
  };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [descCount, setDescCount] = useState(0);
  const fileRef = useRef(null);

  const [searchName, setSearchName] = useState("");
  const [toDeleteId, setToDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    init();
    console.log('first')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiStatus]);

  // Initialization: attempt API, else fallback to public JSON
  const init = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try API
      const res = await fetch(API_BASE, { method: "GET" });
      if (!res.ok) throw new Error(`API GET failed ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      const normalized = arr.map((b) => ({ ...b, images: Array.isArray(b.images) ? b.images : [] }));
      setBuffalos(normalized);
      setApiAvailable(true);
    } catch (apiErr) {
      // API failed -> fallback
      console.warn("API failed, loading fallback JSON...", apiErr);
      try {
  const res = await fetch(`${import.meta.env.BASE_URL}/buffaloData.json`);
  if (!res.ok) throw new Error("Fallback JSON not found: " + res.status);

  const json = await res.json();
  setBuffalos(json.buffaloDetails || []);
  setApiAvailable(false);
} catch (err) {
  console.error("Fallback JSON load failed", err);
  setError("No API and no local buffaloData.json found.");
}
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- helpers -------------------- */
  const prefixFromName = (name) => {
    if (!name) return "ITEM";
    const first = String(name).trim().split(/\s+/)[0] || name;
    return first.replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "ITEM";
  };

  const nextIdForPrefix = (prefix) => {
    const allIds = (buffalos || []).map((b) => b.id).filter(Boolean);
    const matched = allIds.filter((id) => id.startsWith(prefix + "-"));
    if (matched.length === 0) return `${prefix}-001`;
    const nums = matched
      .map((id) => {
        const parts = id.split("-");
        const n = parts[1] ? parseInt(parts[1], 10) : NaN;
        return Number.isFinite(n) ? n : 0;
      })
      .filter(Boolean);
    const max = nums.length ? Math.max(...nums) : 0;
    const next = (max + 1).toString().padStart(3, "0");
    return `${prefix}-${next}`;
  };

  const formatNumber = (n) => {
    if (n == null || n === "") return "-";
    try {
      return Number(n).toLocaleString("en-IN");
    } catch {
      return n;
    }
  };

  /* -------------------- validation -------------------- */
  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = "Name required";
    const p = Number(form.price);
    if (form.price === "" || Number.isNaN(p) || p <= 0) e.price = "Price must be > 0";
    if (!form.images || form.images.length === 0) e.images = "Add at least one image";
    if (form.description && form.description.length > DESC_MAX)
      e.description = `Max ${DESC_MAX} characters`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* -------------------- File -> DataURL -------------------- */
  const readFilesToDataUrls = (files) => {
    const arr = Array.from(files || []);
    return Promise.all(
      arr.map(
        (f) =>
          new Promise((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result);
            fr.onerror = rej;
            fr.readAsDataURL(f);
          })
      )
    );
  };

  const handleImageAdd = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const urls = await readFilesToDataUrls(files);
      setForm((p) => ({ ...p, images: [...(p.images || []), ...urls] }));
    } catch (err) {
      console.error("image read error", err);
    }
  };

  const removeFormImage = (idx) =>
    setForm((p) => {
      const copy = [...(p.images || [])];
      copy.splice(idx, 1);
      return { ...p, images: copy };
    });

  /* -------------------- API CRUD (images included) -------------------- */
  const createBuffaloApi = async (payload) => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`POST failed ${res.status}`);
    return await res.json();
  };

  const updateBuffaloApi = async (id, payload) => {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`PUT failed ${res.status}`);
    return await res.json();
  };

  const deleteBuffaloApi = async (id) => {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`DELETE failed ${res.status}`);
    return true;
  };

  /* -------------------- submit (create or update) -------------------- */
  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setDescCount(0);
    setEditingId(null);
    if (fileRef.current) fileRef.current.value = null;
  };

  const openAddPanel = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const openEditPanel = (item) => {
    setForm({
      name: item.name || "",
      price: String(item.price ?? ""),
      description: item.description || "",
      age: item.age || "",
      location: item.location || "",
      inStock: !!item.inStock,
      images: Array.isArray(item.images) ? item.images : [],
    });
    setDescCount((item.description || "").length);
    setEditingId(item.id);
    setIsPanelOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payloadBase = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description || "",
      age: form.age || "",
      location: form.location || "",
      inStock: !!form.inStock,
      insurance: DEFAULT_INSURANCE,
      images: Array.isArray(form.images) ? form.images : [],
    };

    try {
      if (apiAvailable) {
        // Server mode -> call API
        if (editingId) {
          const payload = { id: editingId, ...payloadBase };
          const updated = await updateBuffaloApi(editingId, payload);
          // server might not include images, ensure client shows images we uploaded
          setBuffalos((prev) =>
            prev.map((b) =>
              b.id === updated.id ? { ...updated, images: payloadBase.images } : b
            )
          );
        } else {
          const prefix = prefixFromName(form.name);
          const id = nextIdForPrefix(prefix);
          const payload = { id, ...payloadBase };
          const created = await createBuffaloApi(payload);
          const createdWithImages = { ...created, images: payloadBase.images };
          setBuffalos((prev) => [...prev, createdWithImages]);
        }
      } else {
        // Fallback mode -> in-memory only
        if (editingId) {
          const updated = { id: editingId, ...payloadBase };
          const next = (buffalos || []).map((b) => (b.id === editingId ? updated : b));
          setBuffalos(next);
        } else {
          const prefix = prefixFromName(form.name);
          const id = nextIdForPrefix(prefix);
          const created = { id, ...payloadBase };
          setBuffalos((prev) => [...(prev || []), created]);
        }
      }

      resetForm();
      setIsPanelOpen(false);
    } catch (err) {
      console.error(err);
      setError(apiAvailable ? "Failed to save to server." : "Failed to save locally (in memory).");
    }
  };

  /* -------------------- delete flow -------------------- */
  const confirmDelete = (id) => {
    setToDeleteId(id);
    setIsDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!toDeleteId) return;

    try {
      if (apiAvailable) {
        await deleteBuffaloApi(toDeleteId);
        setBuffalos((prev) => prev.filter((b) => b.id !== toDeleteId));
      } else {
        setBuffalos((prev) => (prev || []).filter((b) => b.id !== toDeleteId));
      }
      setIsDeleteOpen(false);
      setToDeleteId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete.");
    }
  };

  const cancelDelete = () => {
    setIsDeleteOpen(false);
    setToDeleteId(null);
  };

  /* -------------------- filtering -------------------- */
  const filtered = (buffalos || []).filter((b) =>
    b.name.toLowerCase().includes(searchName.trim().toLowerCase())
  );

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-blue-800 mb-2">Buffalo Manager</h1>
            {/* <div className="text-sm text-slate-600">
              {loading ? "Initializing..." : apiAvailable ? "Connected to API" : "Fallback mode (local JSON - memory only)"}
            </div> */}
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border rounded px-3 py-2 shadow-sm flex items-center gap-3">
              <input
                type="search"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="outline-none text-sm placeholder-slate-400"
              />
              <button
                onClick={() => {
                  setSearchName("");
                }}
                className="text-sm text-slate-500"
              >
                Clear
              </button>
            </div>
            <button
              onClick={init}
              className="px-3 py-2 rounded border text-sm bg-white hover:bg-slate-50"
              title="Re-check API / Reload fallback"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {loading ? (
            <div className="col-span-full text-center py-12">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full bg-white rounded border p-6 text-center text-slate-600">
              No buffalos found. Click the + button to add.
            </div>
          ) : (
            filtered.map((b) => (
              <BuffaloCard
                key={b.id}
                item={b}
                images={Array.isArray(b.images) ? b.images : []}
                onEdit={() => openEditPanel(b)}
                onDelete={() => confirmDelete(b.id)}
                formatNumber={formatNumber}
              />
            ))
          )}
        </div>
      </div>

      <button
        onClick={openAddPanel}
        className="fixed right-6 bottom-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-105 transition-transform"
        title="Add buffalo"
        aria-label="Add buffalo"
      >
        +
      </button>

      {/* Slide-out panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white shadow-xl transform transition-transform duration-300 z-50 ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-hidden={!isPanelOpen}>
        <div className="p-5 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Buffalo" : "Add Buffalo"}</h2>
            <div>
              <button onClick={() => { setIsPanelOpen(false); resetForm(); }} className="px-3 py-1 rounded border text-sm">Close</button>
            </div>
          </div>

          <form onSubmit={submit} className="flex-1 overflow-auto space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="mt-1 w-full border rounded px-3 py-2" />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Age</label>
              <input type="text" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} placeholder="e.g., 3 years" className="mt-1 w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="City, State, Country" className="mt-1 w-full border rounded px-3 py-2" />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">In Stock</label>
              <button type="button" onClick={() => setForm((p) => ({ ...p, inStock: !p.inStock }))} className={`px-3 py-1 rounded text-sm ${form.inStock ? "bg-green-600 text-white" : "bg-slate-100"}`}>
                {form.inStock ? "In Stock" : "Out of Stock"}
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(e) => {
                const txt = e.target.value.slice(0, DESC_MAX);
                setForm((p) => ({ ...p, description: txt }));
                setDescCount(txt.length);
              }} rows={4} className="mt-1 w-full border rounded px-3 py-2" />
              <div className="mt-1 text-xs text-slate-500 flex justify-between">
                <div>{errors.description ? <span className="text-red-500">{errors.description}</span> : "Optional"}</div>
                <div>{descCount}/{DESC_MAX}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Images <span className="text-red-500">*</span></label>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageAdd} className="mt-1 w-full" />
              {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}
            </div>

            {form.images && form.images.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-2 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img} alt={`preview-${idx}`} className="w-20 h-20 object-cover rounded border" />
                      <button type="button" onClick={() => removeFormImage(idx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{editingId ? "Update" : "Add Buffalo"}</button>
              <button type="button" onClick={() => { resetForm(); setIsPanelOpen(false); }} className="px-4 py-2 rounded border">Cancel</button>
              {editingId && (
                <button type="button" onClick={() => { confirmDelete(editingId); setIsPanelOpen(false); }} className="ml-auto px-3 py-2 rounded bg-red-600 text-white">Delete</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Delete modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={cancelDelete} />
          <div className="relative z-10 bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Confirm Delete</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to permanently delete this buffalo?</p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelDelete} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={doDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------
   BuffaloCard and CarouselLarge
   (unchanged, keep as-is)
   --------------------------- */

function BuffaloCard({ item, images = [], onEdit, onDelete, formatNumber }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-[340px] mx-auto mb-5 gap-5">
      <CarouselLarge images={images} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{item.name}</h3>
            <div className="text-xs text-slate-500 mt-1 uppercase font-medium">{item.id}</div>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full font-medium ${item.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {item.inStock ? "In Stock" : "Out of Stock"}
          </div>
        </div>

        <div className="mt-3 text-sm text-slate-600">
          <div className="mb-1"><span className="font-semibold text-slate-800">Age:</span> <span className="ml-1">{item.age || "-"}</span></div>
          <div className="mb-1"><span className="font-semibold text-slate-800">Location:</span> <span className="ml-1">{item.location || "-"}</span></div>
        </div>

        <p className="mt-3 text-sm text-slate-700 line-clamp-3">{item.description}</p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-900">₹{formatNumber(item.price)}</div>
            <div className="text-xs text-slate-500 mt-1">Insurance: ₹{formatNumber(item.insurance ?? DEFAULT_INSURANCE)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="w-9 h-9 rounded flex items-center justify-center bg-white border hover:bg-blue-50" title="Edit" aria-label="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
            </button>

            <button onClick={onDelete} className="w-9 h-9 rounded flex items-center justify-center bg-white border hover:bg-red-50" title="Delete" aria-label="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CarouselLarge({ images }) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    if (hover) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 3500);
    return () => clearInterval(t);
  }, [images, hover]);

  useEffect(() => {
    if (!images || images.length === 0) setIndex(0);
    else setIndex((i) => Math.min(i, images.length - 1));
  }, [images]);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="relative w-full bg-slate-100">
      <div className="w-full h-56 overflow-hidden rounded-t-lg" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {images && images.length > 0 ? (
          <img src={images[index]} alt={`img-${index}`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
        )}
      </div>

      {images && images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center">‹</button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center">›</button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
