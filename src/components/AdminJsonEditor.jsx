function AdminJsonEditor({
  title,
  description,
  value,
  onChange,
  onSave,
  onCancel,
  saving,
  error,
  saveLabel = "Save",
  cancelLabel = "Cancel",
}) {
  return (
    <div className="bg-black/40 border border-li/30 rounded-2xl p-4 md:p-5 space-y-3">
      <div>
        <p className="text-white text-lg font-bold">{title}</p>
        {description && <p className="text-li text-sm mt-1">{description}</p>}
      </div>
      <textarea
        className="w-full min-h-[220px] font-mono text-sm bg-black/60 border border-li/30 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/60"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
      />
      {error && <p className="text-primary text-sm font-bold">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-black font-bold rounded-full disabled:opacity-60"
        >
          {saving ? "Saving…" : saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 border border-li/40 text-li font-bold rounded-full"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}

export default AdminJsonEditor;
