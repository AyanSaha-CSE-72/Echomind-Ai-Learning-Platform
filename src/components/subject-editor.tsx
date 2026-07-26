"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import type { Subject, Collection } from "@/lib/cognitive";
import { IconRenderer, SUBJECT_ICONS, SUBJECT_COLORS, COVER_GRADIENTS } from "./icon-renderer";
import { cn } from "@/lib/utils";

interface SubjectEditorProps {
  subject: Subject | null; // null = creating new
  collections: Collection[];
  onSave: (data: Partial<Subject>) => void;
  onClose: () => void;
}

export function SubjectEditor({ subject, collections, onSave, onClose }: SubjectEditorProps) {
  const [name, setName] = useState(subject?.name ?? "");
  const [icon, setIcon] = useState(subject?.icon ?? "Brain");
  const [color, setColor] = useState(subject?.color ?? "#a78bfa");
  const [cover, setCover] = useState(subject?.cover ?? "gradient-violet-fuchsia");
  const [description, setDescription] = useState(subject?.description ?? "");
  const [collectionId, setCollectionId] = useState<string | null>(subject?.collectionId ?? null);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      icon,
      color,
      cover,
      description: description.trim() || undefined,
      collectionId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-strong rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass-strong rounded-t-3xl flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold">
            {subject ? "Edit Subject" : "Create Subject"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Chemistry, Bar Exam Prep, Japanese N3"
              className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none placeholder:text-ink-400"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you learn in this subject?"
              rows={2}
              className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none placeholder:text-ink-400 resize-none"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {SUBJECT_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    icon === iconName
                      ? "bg-white text-ink-900 scale-110"
                      : "glass hover:bg-white/10",
                  )}
                >
                  <IconRenderer name={iconName} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-10 h-10 rounded-xl transition-all",
                    color === c && "ring-2 ring-white scale-110",
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Cover picker */}
          <div>
            <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
              Cover
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {COVER_GRADIENTS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setCover(g.key)}
                  className={cn(
                    "h-16 rounded-xl bg-gradient-to-br transition-all",
                    g.css,
                    cover === g.key && "ring-2 ring-white scale-105",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={cover?.startsWith("http") ? cover : ""}
                onChange={(e) => setCover(e.target.value)}
                placeholder="Or paste image URL..."
                className="flex-1 glass rounded-xl px-4 py-2 text-xs bg-transparent outline-none placeholder:text-ink-400"
              />
              <button className="glass rounded-xl px-4 py-2 text-xs flex items-center gap-2 hover:bg-white/10">
                <Upload className="w-3 h-3" />
                Upload
              </button>
            </div>
          </div>

          {/* Collection */}
          <div>
            <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
              Collection (optional)
            </label>
            <select
              value={collectionId ?? ""}
              onChange={(e) => setCollectionId(e.target.value || null)}
              className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
            >
              <option value="">No collection</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass-strong rounded-b-3xl flex items-center justify-end gap-3 p-6 border-t border-white/5">
          <button
            onClick={onClose}
            className="glass rounded-xl px-5 py-2.5 text-sm hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            {subject ? "Save Changes" : "Create Subject"}
          </button>
        </div>
      </div>
    </div>
  );
}
