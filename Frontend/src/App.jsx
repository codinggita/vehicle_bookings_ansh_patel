import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/register" element={<div>Register Page</div>} />
      <Route path="/" element={<div>Dashboard Layout</div>} />
    </Routes>
  );
}
