import { useEffect } from 'react';
import { toast } from '@/systems/studio/components/toast';
export default function SystemActionToast() {
  useEffect(() => {
    const message = sessionStorage.getItem('studio:system-action');
    if (!message) return;
    sessionStorage.removeItem('studio:system-action');
    try { toast.add({ title: JSON.parse(message).title }); } catch { /* Ignore stale local state. */ }
  }, []);
  return null;
}
