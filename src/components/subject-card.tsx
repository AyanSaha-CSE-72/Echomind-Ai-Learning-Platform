"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash2,
  Copy,
  Edit3,
  Palette,
  Image as ImageIcon,
  FolderInput,
} from "lucide-react";
import type { Subject, Collection } from "@/lib/cognitive";
import { cn } from "@/lib/utils";
import { IconRenderer } from "./icon-renderer";
import { SubjectEditor } from "./subject-editor";

interface SubjectCardProps {
  subject: Subject;
  conceptCount: number;
  masteryPercent: number;
  collections: Collection[];
  onUpdate: (id: string, data: Partial<Subject>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onOpen: (id: string) => void;
}

export function SubjectCard({
  subject,
  conceptCount,
  masteryPercent,
  collections,
  onUpdate,
  onDelete,
  onDuplicate,
  onArchive,
  onUnarchive,
  onPin,
  onUnpin,
  onOpen,
}: SubjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        className="group relative glass rounded-3xl overflow-hidden lift cursor-pointer"
        onClick={() => onOpen(subject.id)}
      >
        {/* Cover / Gradient */}
        <div
          className={cn(
            "h-32 relative overflow-hidden",
            subject.cover?.startsWith("http") ? "" : `bg-gradient-to-br ${getGradient(subject.cover, subject.color)}`,
          )}
        >
          {subject.cover?.startsWith("http") && (
            <img src={subject.cover} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Pin indicator */}
          {subject.pinned && (
            <div className="absolute top-3 left-3 glass rounded-lg px-2 py-1 text-[10px] flex items-center gap-1">
              <Pin className="w-3 h-3" />
              Pinned
            </div>
          )}

          {/* Menu button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute top-12 right-3 z-20 glass-strong rounded-xl py-2 min-w-[180px] shadow-2xl">
                <MenuItem
                  icon={Edit3}
                  label="Edit"
                  onClick={() => {
                    setEditorOpen(true);
                    setMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon={subject.pinned ? PinOff : Pin}
                  label={subject.pinned ? "Unpin" : "Pin to top"}
                  onClick={() => {
                    subject.pinned ? onUnpin(subject.id) : onPin(subject.id);
                    setMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon={Copy}
                  label="Duplicate"
                  onClick={() => {
                    onDuplicate(subject.id);
                    setMenuOpen(false);
                  }}
                />
                <div className="border-t border-white/5 my-1" />
                <MenuItem
                  icon={subject.archived ? ArchiveRestore : Archive}
                  label={subject.archived ? "Unarchive" : "Archive"}
                  onClick={() => {
                    subject.archived ? onUnarchive(subject.id) : onArchive(subject.id);
                    setMenuOpen(false);
                  }}
                />
                <MenuItem
                  icon={Trash2}
                  label="Delete"
                  danger
                  onClick={() => {
                    if (confirm(`Delete "${subject.name}"? This cannot be undone.`)) {
                      onDelete(subject.id);
                    }
                    setMenuOpen(false);
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: subject.color }}
            >
              <IconRenderer name={subject.icon} className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{subject.name}</h3>
              {subject.description && (
                <p className="text-xs text-ink-400 mt-0.5 line-clamp-1">{subject.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span>{conceptCount} concepts</span>
            <span className="font-semibold" style={{ color: subject.color }}>
              {masteryPercent}% mastered
            </span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{ width: `${masteryPercent}%`, background: subject.color }}
            />
          </div>
        </div>
      </motion.div>

      {editorOpen && (
        <SubjectEditor
          subject={subject}
          collections={collections}
          onSave={(data: Partial<Subject>) => {
            onUpdate(subject.id, data);
            setEditorOpen(false);
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Edit3;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 transition-colors",
        danger ? "text-rose-400" : "text-ink-200",
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function getGradient(cover: string | undefined, fallbackColor: string): string {
  if (!cover) return `from-[${fallbackColor}] to-[${fallbackColor}]/50`;
  const map: Record<string, string> = {
    "gradient-violet-fuchsia": "from-violet-500 to-fuchsia-500",
    "gradient-fuchsia-pink": "from-fuchsia-500 to-pink-500",
    "gradient-cyan-blue": "from-cyan-400 to-blue-500",
    "gradient-amber-rose": "from-amber-400 to-rose-400",
    "gradient-emerald-cyan": "from-emerald-400 to-cyan-400",
  };
  return map[cover] ?? "from-violet-500 to-fuchsia-500";
}
