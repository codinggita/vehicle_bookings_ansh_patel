import React from 'react';
import { LoaderCircle } from 'lucide-react';
export function FullLoader({ label = 'Loading' }) {
  return <div className="full-loader"><div className="loader-mark"><span /><span /><span /></div><p>{label}</p></div>;
}
export function PageHeader({ eyebrow, title, description, actions }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions && <div className="header-actions">{actions}</div>}</header>;
}
export function ButtonLoader() { return <LoaderCircle size={16} className="spin" />; }
