import { Route, Routes } from 'react-router-dom';
import { CurrentUserProvider, useCurrentUser } from './context/CurrentUserContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { ErrorState, LoadingState } from './components/states';
import { TicketListPage } from './pages/TicketListPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { EditTicketPage } from './pages/EditTicketPage';
import { TicketDetailPage } from './pages/TicketDetailPage';

/** Gates the app until the seeded users have loaded (needed for author context). */
function AppContent() {
  const { loading, error } = useCurrentUser();

  if (loading) return <LoadingState label="Starting up…" />;
  if (error) {
    return (
      <ErrorState
        message={`Could not load users. ${error}`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<TicketListPage />} />
      <Route path="/tickets/new" element={<CreateTicketPage />} />
      <Route path="/tickets/:id" element={<TicketDetailPage />} />
      <Route path="/tickets/:id/edit" element={<EditTicketPage />} />
      <Route path="*" element={<ErrorState message="Page not found." />} />
    </Routes>
  );
}

export default function App() {
  return (
    <CurrentUserProvider>
      <ToastProvider>
        <Layout>
          <AppContent />
        </Layout>
      </ToastProvider>
    </CurrentUserProvider>
  );
}
