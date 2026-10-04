---
title: Tabs
description: Untitled UI underline tabs with React Aria keyboard and selection behavior.
docs: https://www.untitledui.com/react/components/tabs
---

## When to use

Use tabs to switch between related examples in one place. Each tab needs a matching panel ID and the list needs an accessible label.

Marketing includes horizontal underline tabs, adapted from the MIT Untitled UI component. Arrow keys move focus; Enter or Space selects a panel. Disabled tabs are skipped. Keep navigation to another page as a link.

## Example

Compose `Tabs.List`, `Tabs.Item`, and `Tabs.Panel`. Use `defaultSelectedKey` for an initial selection or `selectedKey` and `onSelectionChange` for a controlled selection. See [source and adaptations](/systems/marketing/context/library).
