// App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Signup } from './pages/Signup';
import { Signin } from "./pages/Signin";
import { Blogs } from "./pages/Blogs";
import { Blog } from "./pages/Blog";
import { Publish } from "./pages/Publish";
import { Profile } from "./pages/Profile";
import { Edit } from "./pages/Edit";
import { AuthProvider } from './context/AuthContext';
import { HeaderLayout } from './layout/HeaderLayout';
import './App.css';
import ErrorBoundary from './component/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Without header */}
            <Route path='/signup' element={<Signup />} />
            <Route path='/signin' element={<Signin />} />

            {/* With header */}
            <Route element={<HeaderLayout />}>
              <Route path='/' element={<Blogs />} />
              <Route path="/blog/:id" element={<Blog />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/publish" element={<Publish />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/edit/:id" element={<Edit />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
