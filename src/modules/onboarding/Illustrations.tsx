import { useId } from 'react';

// Adapted from StudioOwnership and StudioFoundation in the creator's marketing site.
// Use Studio theme colors and human labels; these sketches introduce concepts, not file formats.
const paper = 'var(--background)';
const ink = 'var(--foreground)';
const muted = 'var(--muted-foreground)';
const border = 'var(--border)';

export function AgentSketch() {
  const id = useId();
  return <svg viewBox="0 0 440 210" className="h-44 w-full text-foreground" role="img" aria-label="Describe your idea to your coding agent, then try and refine the result in Design Studio.">
    <defs><pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="currentColor" opacity=".07" /></pattern></defs>
    <rect x="8" y="8" width="424" height="194" fill={`url(#${id})`} />
    <g transform="rotate(-3 126 102)">
      <rect x="32" y="32" width="200" height="134" rx="5" fill={paper} stroke={border} />
      <path d="M32 58H232" stroke={border} /><text x="47" y="49" fontSize="12" fill={muted}>Your coding agent</text>
      <text x="47" y="86" fontSize="12" fill={ink}>Let’s explore an idea.</text>
      <path d="M47 104H177M47 115H206M47 126H164" stroke="currentColor" opacity=".2" />
      <rect x="47" y="138" width="56" height="14" rx="3" fill="currentColor" opacity=".08" />
    </g>
    <g transform="rotate(3 302 135)">
      <rect x="209" y="72" width="199" height="118" rx="5" fill={paper} stroke={border} />
      <path d="M209 98H408" stroke={border} /><text x="223" y="89" fontSize="12" fill={muted}>Design Studio</text>
      <rect x="223" y="111" width="44" height="62" rx="3" fill="currentColor" opacity=".07" />
      <path d="M279 116H393M279 131H367M279 155H393M279 170H352" stroke="currentColor" opacity=".3" />
      <path d="M355 130V148L360 143L365 151L369 149L364 141H372Z" fill={ink} />
    </g>
  </svg>;
}

export function SystemSketch({ selected }: { selected: number }) {
  const labels = ['Theme + components', 'Context', 'Skills'];
  return <svg viewBox="0 0 440 155" className="h-32 w-full text-foreground" role="img" aria-label="Theme and components, context, and skills work together to guide your prototypes.">
    {labels.map((label, i) => <g key={label} opacity={selected === i ? 1 : .4}>
      <rect x="18" y={12 + i * 45} width="238" height="36" rx="4" fill={paper} stroke={selected === i ? ink : border} />
      <text x="32" y={35 + i * 45} fill={ink} fontSize="13">{label}</text>
    </g>)}
    <path d="M256 30H284V120H256M256 75H314" stroke="currentColor" opacity=".3" fill="none" />
    <rect x="314" y="49" width="108" height="54" rx="4" fill={paper} stroke={border} />
    <text x="328" y="81" fontSize="13" fill={ink}>Prototypes</text>
  </svg>;
}

export function ArtifactSketch({ kind }: { kind: string }) {
  return <svg viewBox="0 0 440 150" className="h-32 w-full text-foreground" role="img" aria-label={kind === 'view' ? 'An inbox screen with messages to explore.' : kind === 'document' ? 'A brief explaining the problem and audience.' : kind === 'diagrams' ? 'A flow from receiving a message to reviewing and resolving it.' : 'Screens, a brief, and a flow arranged together on a canvas.'}>
    {kind === 'view' && <>
      <rect x="63" y="9" width="314" height="132" rx="4" fill={paper} stroke={border} />
      <path d="M63 35H377M126 35V141" stroke={border} /><text x="77" y="27" fontSize="11" fill={muted}>Feedback Inbox</text>
      <path d="M76 51H111M76 63H101M76 75H105" stroke="currentColor" opacity=".25" />
      <rect x="140" y="47" width="61" height="16" rx="3" fill="currentColor" opacity=".08" />
      <path d="M140 77H360M140 98H360M140 119H360" stroke={border} />
      <path d="M144 87H231M144 108H259M144 129H218" stroke="currentColor" opacity=".4" />
      <rect x="326" y="83" width="28" height="7" rx="2" fill="currentColor" opacity=".15" />
    </>}
    {kind === 'document' && <>
      <rect x="102" y="8" width="236" height="135" rx="4" fill={paper} stroke={border} />
      <text x="121" y="33" fontSize="13" fill={ink}>The idea we’re exploring</text>
      <text x="121" y="58" fontSize="10" fill={muted}>The problem</text>
      <path d="M121 69H317M121 78H299M121 87H307" stroke="currentColor" opacity=".25" />
      <text x="121" y="109" fontSize="10" fill={muted}>Who it’s for</text>
      <path d="M121 120H311M121 129H279" stroke="currentColor" opacity=".25" />
    </>}
    {kind === 'diagrams' && <>
      <g fill={paper} stroke={border}><rect x="22" y="54" width="100" height="43" rx="4" /><path d="M178 75L220 33L262 75L220 117Z" /><rect x="317" y="54" width="101" height="43" rx="4" /></g>
      <path d="M122 75H178M262 75H317" stroke="currentColor" opacity=".4" />
      <g fontSize="12" fill={ink} textAnchor="middle"><text x="72" y="80">Receive</text><text x="220" y="80">Review</text><text x="367" y="80">Resolve</text></g>
    </>}
    {kind === 'canvas' && <>
      <g fill={paper} stroke={border}><rect x="35" y="20" width="122" height="87" rx="3" transform="rotate(-3 96 63)" /><rect x="186" y="9" width="103" height="71" rx="3" transform="rotate(2 237 44)" /><rect x="177" y="96" width="180" height="44" rx="3" /><rect x="318" y="31" width="82" height="52" rx="3" /></g>
      <g fontSize="11" fill={muted}><text x="48" y="39">A screen</text><text x="199" y="28">The brief</text><text x="329" y="50">A note</text></g>
      <path d="M49 54H141M49 66H132M49 78H139M200 42H271M200 52H262M200 62H267" stroke="currentColor" opacity=".25" />
      <g stroke="currentColor" fill="none" opacity=".35"><rect x="190" y="109" width="38" height="17" rx="2" /><path d="M228 118H243L257 104L271 118L257 132L243 118M271 118H299" /><rect x="299" y="109" width="44" height="17" rx="2" /></g>
    </>}
  </svg>;
}
