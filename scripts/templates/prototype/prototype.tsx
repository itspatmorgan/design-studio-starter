import { Placeholder } from '@/lib/placeholder';

export default function Prototype() {
  return <Placeholder file={import.meta.url} />;
}
