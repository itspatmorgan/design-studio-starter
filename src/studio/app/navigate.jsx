export function navigate(params) {
  const search = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
  history.pushState(null, '', search ? `?${search}` : location.pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function Link({ to, children, ...props }) {
  const search = new URLSearchParams(Object.entries(to).filter(([, v]) => v != null && v !== '')).toString();
  return (
    <a
      href={search ? `?${search}` : '.'}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
