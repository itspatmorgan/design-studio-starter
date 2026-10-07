---
title: Prototypes & systems
description: Connect an exploration to its shared toolkit and knowledge.
order: 4
module: prototypes
toc: true
---

## What belongs in a prototype?

A prototype holds one exploration. Its pieces are called **artifacts**. Use the ones that help explain your idea.

| Artifact | Purpose |
| --- | --- |
| View | A working screen or state you can interact with. |
| Document | A brief, notes, decisions, or handoff, with links and previews. |
| Diagram | A flow or relationship, described in Mermaid. |
| Canvas | Sketches, annotations, and comparisons arranged together. |

Views are always available. Documents, Diagrams, and Canvases require their corresponding modules. Disabling one preserves its files but hides it from normal navigation.

## What belongs in a system?

A system supplies the shared foundation for multiple prototypes.

| Part | Contains |
| --- | --- |
| Theme | Colors, typography, spacing, and other visual choices. |
| Components | Reusable interface pieces with live examples. |
| Assets | Fonts, icons, logos, and images. |
| Context | Audience, goals, research, principles, and standards. |
| Skills | Instructions for recurring agent tasks. |

Keep reusable knowledge in the system's **Context**. Keep an exploration's brief, decisions, and open questions with its prototype. Ask the agent to update existing guidance rather than duplicate it.

Product and Marketing are starter examples. **Studio**, marked **Platform**, powers the application itself and is unavailable for prototypes.

## How do I create a prototype?

Ask your agent, describing the goal and system. Or select **New prototype**, enter a title, and choose a system. The interface creates starting files; your agent builds the intended experience.

The assigned system appears beneath the prototype title. Browsing another system does not change it. **No system — custom styling** uses local components and styles.

Changing the default in Studio settings affects new prototypes and preserves existing assignments. Changes to a shared system's components or styles can affect every prototype using it.

## How do I bring in my own system?

Ask your agent to assess or create one. Supply your component source or package, theme, fonts and assets, usage examples, and relevant product knowledge.

| Starting point | What to expect |
| --- | --- |
| shadcn/ui or Untitled UI | The agent can curate a toolkit and Tailwind theme around your needs. |
| Your own React components | Assess styling, dependencies, and needed adaptations before importing. |
| Another framework or application-dependent code | Assess feasibility and migration effort first; engineering help may be useful. |
| Visual references | Guide appearance; they do not supply your production components. |

Try representative screens before relying on an imported system. Components tied to a backend or application shell may need simulated behavior or replacement dependencies.

To start in the interface, select **New system**. Its blank overview offers **Curate a toolkit from open libraries** and **Bring your own system**, with prompts to copy to your agent. Creating systems requires local Admin access.

## How do I organize artifacts?

Use **+** in navigation to add artifacts or folders. Drag to move or reorder them. The first available artifact is where the prototype opens.

Right-click an item for file actions. Studio repairs known links and embeds when files move within a prototype. Moves in your editor or Finder need Studio running for repair. Deleted targets, moves while Studio is closed, and dynamically built links may need the agent's help.

## How do supporting artifacts connect?

**Documents** use Markdown and can preview artifacts from the same prototype. Mermaid diagrams can also appear inside a document without the standalone Diagrams module. Documents and diagrams use Studio's reading style.

**Canvases** use Excalidraw. Draw with the toolbar; press **N** for a sticky note. Drag an artifact from navigation onto the canvas, or copy its link and paste over the canvas.

View and diagram previews follow their source. Documents and other canvases appear as link cards. Open the original to interact or edit. Canvas annotations do not automatically change screens.

Canvases embed artifacts from their own prototype and cannot store images. Changes save automatically locally. Other contributors' and published canvases are read-only. Importing **Mermaid to Excalidraw** creates independent shapes, not a synchronized diagram.

## Can I try a different appearance or system?

Right-click a view and choose **Make lofi** for grayscale and handwritten type. **Make hi-fi** restores normal appearance.

To try another system, choose **Duplicate** and select the target system. This creates a rebuild copy and preserves the original. Use **Copy rebuild instructions** in the copy's sidebar and give them to your agent. The copy keeps its current system until the agent migrates and verifies it; duplication does not convert code automatically.

## What do archive and delete do?

Use the prototype or system's **…** menu. Permissions determine available actions.

| Action | Prototype | System |
| --- | --- | --- |
| Rename | Updates its title, folder, and known references. | Updates its name, folder, and known references. |
| Archive | Keeps work locally; excludes it from publication. | Also archives associated active prototypes. |
| Restore | Makes work active again. | Can also restore prototypes archived with it. |
| Delete | Permanently removes the prototype. | Removes system files; associated prototype source remains but needs another system and a rebuild. |

Restore archived work before routine editing. Choose another default before archiving or deleting the default system. Studio keeps no recovery copy for deletion; ask the agent to check available version history before removing work you may need.
