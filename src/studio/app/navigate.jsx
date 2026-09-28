// replace: update the URL without adding a history entry (used while typing in search).
export function navigate(params, { replace = false } = {}) {
  const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
  history[replace ? 'replaceState' : 'pushState'](null, '', search ? `?${search}` : location.pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// Wrappers like tooltips pass their own onClick, so it runs first instead of replacing ours.
export function Link({ to, children, onClick, ...props }) {
  const search = new URLSearchParams(Object.entries(to).filter(([, v]) => v != null && v !== '')).toString();
  return (
    <a
      {...props}
      href={search ? `?${search}` : '.'}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
