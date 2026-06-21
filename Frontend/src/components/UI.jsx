import React from 'react';
export function FullLoader({ label = 'Loading' }) {
  return <div className="full-loader"><div className="loader-mark"><span /><span /><span /></div><p>{label}</p></div>;
}
