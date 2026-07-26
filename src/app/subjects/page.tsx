"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  FolderPlus,
  Search,
  Pin,
  Archive,
  Grid3x3,
  List,
  Sparkles,
  BookOpen,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useEcho } from "@/lib/store";
import { currentRetention } from "@/lib/cognitive";
import { SubjectCard } from "@/components/subject-card";
import { SubjectEditor } from "@/components/subject-editor";
import { IconRenderer } from "@/components/icon-renderer";
import { cn } from "@/lib/utils";

type ViewMode = "all" | "pinned" | "archived";
type LayoutMode = "grid" | "list";

export default function SubjectsPage() {
  const router = useRouter();
  const subjects = useEcho((s) => s.subjects);
  const collections = useEcho((s) => s.collections);
  const concepts = useEcho((s) => s.concepts);

  const createSubject = useEcho((s) => s.createSubject);
  const updateSubject = useEcho((s) => s.updateSubject);
  const deleteSubject = useEcho((s) => s.deleteSubject);
  const archiveSubject = useEcho((s) => s.archiveSubject);
  const unarchiveSubject = useEcho((s) => s.unarchiveSubject);
  const duplicateSubject = useEcho((s) => s.duplicateSubject);
  const pinSubject = useEcho((s) => s.pinSubject);
  const unpinSubject = useEcho((s) => s.unpinSubject);
  const reorderSubjects = useEcho((s) => s.reorderSubjects);

  const createCollection = useEcho((s) => s.createCollection);
  const updateCollection = useEcho((s) => s.updateCollection);
  const deleteCollection = useEcho((s) => s.deleteCollection);

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid");
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [collectionEditorOpen, setCollectionEditorOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);

  // Filter & sort subjects
  const filteredSubjects = useMemo(() => {
    let result = [...subjects];

    // View mode
    if (viewMode === "pinned") result = result.filter((s) => s.pinned && !s.archived);
    else if (viewMode === "archived") result = result.filter((s) => s.archived);
    else result = result.filter((s) => !s.archived);

    // Collection filter
    if (activeCollection !== null) {
      result = result.filter((s) => s.collectionId === activeCollection);
    } else if (viewMode !== "archived") {
      // "All" shows only ungrouped subjects (no collection)
      // Actually, "All" should show all. Let me think...
      // We'll show all if activeCollection is null and viewMode is "all".
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q),
      );
    }

    // Sort: pinned first, then by position
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.position - b.position;
    });

    return result;
  }, [subjects, viewMode, search, activeCollection]);

  // Stats
  const totalSubjects = subjects.filter((s) => !s.archived).length;
  const totalConcepts = concepts.length;
  const pinnedCount = subjects.filter((s) => s.pinned && !s.archived).length;

  return (
    <AppShell>
      <div className="max-w-[1600px] mx-auto p-6 md:p-10 pb-24 lg:pb-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Your Learning{" "}
              <span
                className="text-gradient italic"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Universe.
              </span>
            </h1>
            <p className="text-ink-300 mt-3 max-w-2xl">
              Every subject is yours to shape. Create, rename, recolor, archive, duplicate, pin, and
              organize into collections. Your mind, your structure.
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-ink-400">
              <span>{totalSubjects} subjects</span>
              <span>·</span>
              <span>{totalConcepts} concepts</span>
              <span>·</span>
              <span>{pinnedCount} pinned</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollectionEditorOpen(true)}
              className="glass rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 hover:border-violet-500/40"
            >
              <FolderPlus className="w-4 h-4" />
              New Collection
            </button>
            <button
              onClick={() => setEditorOpen(true)}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-violet-500/30"
            >
              <Plus className="w-4 h-4" />
              New Subject
            </button>
          </div>
        </motion.div>

        {/* Toolbar */}
        <div className="glass rounded-2xl p-2 flex flex-wrap items-center gap-2 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3">
            <Search className="w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-400 py-2"
            />
          </div>

          {/* View tabs */}
          <div className="flex gap-1">
            <ViewTab
              active={viewMode === "all" && activeCollection === null}
              onClick={() => {
                setViewMode("all");
                setActiveCollection(null);
              }}
              icon={Grid3x3}
              label="All"
            />
            <ViewTab
              active={viewMode === "pinned"}
              onClick={() => {
                setViewMode("pinned");
                setActiveCollection(null);
              }}
              icon={Pin}
              label="Pinned"
            />
            <ViewTab
              active={viewMode === "archived"}
              onClick={() => {
                setViewMode("archived");
                setActiveCollection(null);
              }}
              icon={Archive}
              label="Archived"
            />
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="flex gap-1 border-l border-white/5 pl-2">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    setActiveCollection(activeCollection === col.id ? null : col.id);
                    setViewMode("all");
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all",
                    activeCollection === col.id
                      ? "bg-white text-ink-900"
                      : "hover:bg-white/5 text-ink-300",
                  )}
                >
                  <IconRenderer name={col.icon} className="w-3 h-3" />
                  {col.name}
                </button>
              ))}
            </div>
          )}

          {/* Layout toggle */}
          <div className="flex gap-1 border-l border-white/5 pl-2">
            <button
              onClick={() => setLayoutMode("grid")}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                layoutMode === "grid" ? "bg-white/10" : "hover:bg-white/5",
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode("list")}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                layoutMode === "list" ? "bg-white/10" : "hover:bg-white/5",
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subjects grid */}
        {filteredSubjects.length === 0 ? (
          <EmptyState
            onCreate={() => setEditorOpen(true)}
            hasSearch={!!search}
            viewMode={viewMode}
          />
        ) : layoutMode === "grid" ? (
          <Reorder.Group
            axis="y"
            values={filteredSubjects}
            onReorder={(newOrder) => {
              // For now, just update positions based on new order
              // In a full implementation, you'd compute from/to indices
              // and call reorderSubjects
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filteredSubjects.map((subject) => {
                const subjectConcepts = concepts.filter((c) => c.subjectId === subject.id);
                const masteryPercent =
                  subjectConcepts.length === 0
                    ? 0
                    : Math.round(
                        (subjectConcepts.filter((c) => c.strength > 0.8).length /
                          subjectConcepts.length) *
                          100,
                      );
                return (
                  <Reorder.Item key={subject.id} value={subject}>
                    <SubjectCard
                      subject={subject}
                      conceptCount={subjectConcepts.length}
                      masteryPercent={masteryPercent}
                      collections={collections}
                      onUpdate={updateSubject}
                      onDelete={deleteSubject}
                      onDuplicate={duplicateSubject}
                      onArchive={archiveSubject}
                      onUnarchive={unarchiveSubject}
                      onPin={pinSubject}
                      onUnpin={unpinSubject}
                      onOpen={(id) => router.push(`/subjects/${id}`)}
                    />
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        ) : (
          <div className="space-y-2">
            {filteredSubjects.map((subject) => {
              const subjectConcepts = concepts.filter((c) => c.subjectId === subject.id);
              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-2xl p-4 flex items-center gap-4 hover:border-violet-500/40 transition-colors cursor-pointer"
                  onClick={() => router.push(`/subjects/${subject.id}`)}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: subject.color }}
                  >
                    <IconRenderer name={subject.icon} className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{subject.name}</div>
                    <div className="text-xs text-ink-400 truncate">
                      {subject.description || `${subjectConcepts.length} concepts`}
                    </div>
                  </div>
                  <div className="text-xs text-ink-400">{subjectConcepts.length} concepts</div>
                  {subject.pinned && <Pin className="w-4 h-4 text-violet-300" />}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Collections summary (when viewing all) */}
        {viewMode === "all" && activeCollection === null && collections.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold mb-4">Collections</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((col) => {
                const colSubjects = subjects.filter(
                  (s) => s.collectionId === col.id && !s.archived,
                );
                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-6 relative overflow-hidden group hover:border-violet-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: col.color }}
                      >
                        <IconRenderer name={col.icon} className="w-6 h-6 text-white" />
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete collection "${col.name}"?`)) {
                            deleteCollection(col.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-xs text-rose-400 hover:text-rose-300 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{col.name}</h3>
                    <div className="text-xs text-ink-400 mb-4">
                      {colSubjects.length} subject{colSubjects.length !== 1 && "s"}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {colSubjects.slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className="glass rounded-lg px-2 py-1 text-[10px] flex items-center gap-1"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: s.color }}
                          />
                          {s.name}
                        </span>
                      ))}
                      {colSubjects.length > 4 && (
                        <span className="text-[10px] text-ink-400">+{colSubjects.length - 4} more</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Editors */}
      {editorOpen && (
        <SubjectEditor
          subject={null}
          collections={collections}
          onSave={(data) => {
            createSubject({
              name: data.name!,
              icon: data.icon!,
              color: data.color!,
              cover: data.cover,
              description: data.description,
              pinned: false,
              archived: false,
              collectionId: data.collectionId ?? null,
            });
            setEditorOpen(false);
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {collectionEditorOpen && (
        <CollectionEditor
          collection={editingCollection ? collections.find((c) => c.id === editingCollection) ?? null : null}
          onSave={(data) => {
            if (editingCollection) {
              updateCollection(editingCollection, data);
            } else {
              createCollection({ ...data, archived: false });
            }
            setCollectionEditorOpen(false);
            setEditingCollection(null);
          }}
          onClose={() => {
            setCollectionEditorOpen(false);
            setEditingCollection(null);
          }}
        />
      )}
    </AppShell>
  );
}

function ViewTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Grid3x3;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all",
        active ? "bg-white text-ink-900" : "hover:bg-white/5 text-ink-300",
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

function EmptyState({
  onCreate,
  hasSearch,
  viewMode,
}: {
  onCreate: () => void;
  hasSearch: boolean;
  viewMode: ViewMode;
}) {
  return (
    <div className="glass rounded-3xl p-16 text-center">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
        {hasSearch ? (
          <Search className="w-10 h-10 text-ink-400" />
        ) : viewMode === "archived" ? (
          <Archive className="w-10 h-10 text-ink-400" />
        ) : (
          <Sparkles className="w-10 h-10 text-violet-300" />
        )}
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {hasSearch
          ? "No subjects match your search"
          : viewMode === "archived"
          ? "No archived subjects"
          : viewMode === "pinned"
          ? "No pinned subjects"
          : "Your universe is empty"}
      </h2>
      <p className="text-sm text-ink-400 mb-6 max-w-md mx-auto">
        {hasSearch
          ? "Try a different search term."
          : viewMode === "archived"
          ? "Archive subjects you're not currently studying."
          : viewMode === "pinned"
          ? "Pin your most important subjects for quick access."
          : "Create your first subject and start building your personalized learning universe."}
      </p>
      {!hasSearch && viewMode === "all" && (
        <button
          onClick={onCreate}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-medium inline-flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Create Subject
        </button>
      )}
    </div>
  );
}

function CollectionEditor({
  collection,
  onSave,
  onClose,
}: {
  collection: { id: string; name: string; icon: string; color: string } | null;
  onSave: (data: { name: string; icon: string; color: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(collection?.name ?? "");
  const [icon, setIcon] = useState(collection?.icon ?? "Folder");
  const [color, setColor] = useState(collection?.color ?? "#8b5cf6");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-strong rounded-3xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            {collection ? "Edit Collection" : "Create Collection"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Semester 1, Medical Boards"
                className="w-full glass rounded-xl px-4 py-3 text-sm bg-transparent outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
                Icon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {["Folder", "GraduationCap", "Briefcase", "BookOpen", "Layers", "Target"].map((i) => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      icon === i ? "bg-white text-ink-900" : "glass hover:bg-white/10",
                    )}
                  >
                    <IconRenderer name={i} className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink-400 mb-2 block">
                Color
              </label>
              <div className="flex gap-2">
                {["#8b5cf6", "#d946ef", "#22d3ee", "#34d399", "#fbbf24", "#fb7185"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-10 h-10 rounded-xl",
                      color === c && "ring-2 ring-white",
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-white/5">
          <button onClick={onClose} className="glass rounded-xl px-5 py-2.5 text-sm">
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, icon, color })}
            disabled={!name.trim()}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {collection ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
