import React from 'react';
import { AlertTriangle, LoaderCircle, RefreshCw } from 'lucide-react';
export function FullLoader({ label = 'Loading' }) {
  return <div className="full-loader"><div className="loader-mark"><span /><span /><span /></div><p>{label}</p></div>;
}
export function PageHeader({ eyebrow, title, description, actions }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions && <div className="header-actions">{actions}</div>}</header>;
}
export function Status({ value }) {
  const kind = value === 'Success' ? 'success' : value?.includes('Canceled') ? 'danger' : 'warning';
  return <span className={status }><i />{value || 'Unknown'}</span>;
}
export function Empty({ title = 'No records found', message = 'Try adjusting the current filters.' }) {
  return <div className="empty"><span>00</span><h3>{title}</h3><p>{message}</p></div>;
}
export function ErrorPanel({ message, retry }) {
  return <div className="error-panel"><AlertTriangle /><div><b>Unable to load live data</b><p>{message}</p></div>{retry && <button className="button ghost" onClick={retry}><RefreshCw size={15} />Retry</button>}</div>;
}
export function ButtonLoader() { return <LoaderCircle size={16} className="spin" />; }
