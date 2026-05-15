import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Layout from '@/components/Layout';
import { useRole } from '@/contexts/useRole';
import type { Role } from '@/types/domain';
import Ecosystem from '@/views/Ecosystem';
import FeedbackInbox from '@/views/FeedbackInbox';
import History from '@/views/History';
import Home from '@/views/Home';
import ManagerDashboard from '@/views/ManagerDashboard';
import MayaChat from '@/views/MayaChat';
import NotFound from '@/views/NotFound';
import OnboardingProgress from '@/views/OnboardingProgress';
import ProjectCanvas from '@/views/ProjectCanvas';
import ToolsProvisioning from '@/views/ToolsProvisioning';

import type { ReactElement } from 'react';

function RequireRole({ allow, children }: { allow: Role[]; children: ReactElement }) {
  const { role } = useRole();
  if (!allow.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />

          <Route
            path="onboarding"
            element={
              <RequireRole allow={['employee']}>
                <OnboardingProgress />
              </RequireRole>
            }
          />
          <Route
            path="maya"
            element={
              <RequireRole allow={['employee']}>
                <MayaChat />
              </RequireRole>
            }
          />
          <Route
            path="history"
            element={
              <RequireRole allow={['employee']}>
                <History />
              </RequireRole>
            }
          />

          <Route
            path="team"
            element={
              <RequireRole allow={['manager', 'admin']}>
                <ManagerDashboard />
              </RequireRole>
            }
          />
          <Route
            path="tools"
            element={
              <RequireRole allow={['manager', 'admin']}>
                <ToolsProvisioning />
              </RequireRole>
            }
          />
          <Route
            path="feedback"
            element={
              <RequireRole allow={['manager', 'admin']}>
                <FeedbackInbox />
              </RequireRole>
            }
          />

          <Route
            path="canvas"
            element={
              <RequireRole allow={['admin']}>
                <ProjectCanvas />
              </RequireRole>
            }
          />

          <Route path="ecosystem" element={<Ecosystem />} />

          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
