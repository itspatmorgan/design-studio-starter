import { Tabs } from './tabs';

export function ArtifactExamples() {
  return <Tabs defaultSelectedKey="view">
    <Tabs.List aria-label="Artifact example">
      <Tabs.Item id="view">View</Tabs.Item>
      <Tabs.Item id="diagram">Diagram</Tabs.Item>
      <Tabs.Item id="canvas" isDisabled>Canvas (unavailable)</Tabs.Item>
    </Tabs.List>
    <Tabs.Panel id="view" className="pt-4 text-sm text-text-secondary">A working interface built with the assigned system.</Tabs.Panel>
    <Tabs.Panel id="diagram" className="pt-4 text-sm text-text-secondary">A portable Mermaid model of the idea.</Tabs.Panel>
    <Tabs.Panel id="canvas" className="pt-4">Unavailable example.</Tabs.Panel>
  </Tabs>;
}
