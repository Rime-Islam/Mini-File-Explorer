import type { FileSystemNode, FolderNode, PersistedFileSystem } from "@/types";

const STORAGE_KEY = "webbly_file_explorer_v1";
const SCHEMA_VERSION = 1;

// ─── helpers ──────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeFolder(name: string, children: FileSystemNode[] = []): FolderNode {
  const now = Date.now();
  return {
    id: generateId(),
    name,
    type: "folder",
    children,
    isExpanded: false,
    createdAt: now,
    updatedAt: now,
  };
}

function makeFile(name: string, content = "") {
  const now = Date.now();
  return {
    id: generateId(),
    name,
    type: "textfile" as const,
    content,
    size: new Blob([content]).size,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── seed data ────────────────────────────────────────────────────────────────

export function buildSeedData(): FolderNode {
  return {
    ...makeFolder("My Files", [
      {
        ...makeFolder("Documents", [
          makeFolder("Work", [
            makeFile(
              "project-brief.txt",
              "Project: Webbly Media Rebrand\n\nObjective: Refresh brand identity for Q1 launch.\n\nDeliverables:\n- New logo variants\n- Color palette\n- Typography guide\n- Component library"
            ),
            makeFile(
              "tasks.txt",
              "[ ] Finalise wireframes\n[ ] Client review call — Thursday 2pm\n[ ] Export assets for dev handoff\n[x] Initial mood board\n[x] Stakeholder alignment"
            ),
          ]),
          makeFolder("Personal", [
            makeFile(
              "journal.txt",
              "March 12\nStarted using the new file explorer. Feels snappy.\n\nMarch 15\nAdded GSAP animations — the stagger on folder open looks great."
            ),
          ]),
          makeFile(
            "report.txt",
            "Q3 Report — Webbly Media\n\nRevenue: +24% vs Q2\nActive projects: 11\nTeam utilisation: 87%\n\nKey wins this quarter:\n1. Launched three major client projects\n2. Onboarded two enterprise accounts\n3. Reduced delivery time by 18%"
          ),
          makeFile(
            "meeting-notes.txt",
            "Sprint Planning — Oct 7\n\nAttendees: Sara, Joel, Min, Ade\n\nDiscussed:\n- File explorer MVP scope\n- GSAP animation approach\n- shadcn component integration\n\nAction items:\n- Sara: finish sidebar by Friday\n- Joel: wire up localStorage hook"
          ),
        ]),
        isExpanded: true,
      } as FolderNode,
      makeFolder("Projects", [
        makeFile("roadmap.txt", "2024 Roadmap\n\nQ1: File explorer launch\nQ2: Collaboration features\nQ3: Mobile app\nQ4: API integrations"),
      ]),
      makeFile("readme.txt", "Welcome to Webbly File Explorer!\n\nThis is your personal file system. Everything is saved automatically to localStorage.\n\nTips:\n- Right-click any item for options\n- Double-click a text file to open it\n- Use the + button to create new items"),
    ]),
    isExpanded: true,
  };
}

// ─── persistence ──────────────────────────────────────────────────────────────

export function loadFromStorage(): FolderNode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedData();
    const parsed: PersistedFileSystem = JSON.parse(raw);
    if (parsed.version !== SCHEMA_VERSION) return buildSeedData();
    return parsed.root;
  } catch {
    return buildSeedData();
  }
}

export function saveToStorage(root: FolderNode): void {
  try {
    const data: PersistedFileSystem = {
      version: SCHEMA_VERSION,
      root,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to persist file system:", e);
  }
}