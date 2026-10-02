import { Textarea } from '@/platform/components/textarea';

export const Default = () => <Textarea placeholder="What it does, and when to use it." rows={3} className="w-72" />;

export const Disabled = () => <Textarea placeholder="Disabled" disabled rows={3} className="w-72" />;

export const Invalid = () => <Textarea defaultValue="Too long…" aria-invalid rows={3} className="w-72" />;
