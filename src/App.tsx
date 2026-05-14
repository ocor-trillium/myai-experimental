import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from '@/components/Layout';
import About from '@/views/About';
import Experiments from '@/views/Experiments';
import Home from '@/views/Home';
import NotFound from '@/views/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="experiments" element={<Experiments />} />
          <Route path="about" element={<About />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
