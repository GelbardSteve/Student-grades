import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PageLayout } from './components/PageLayout/PageLayout';
import { LoginPage } from './features/auth/LoginPage';
import { RequireAuth } from './features/auth/RequireAuth';
import { ClassPage } from './features/classes/ClassPage';
import { ClassesPage } from './features/classes/ClassesPage';
import { StudentsPage } from './features/students/StudentsPage';

const protectedPage = (page) => (
  <RequireAuth>
    <PageLayout>{page}</PageLayout>
  </RequireAuth>
);

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/classes" element={protectedPage(<ClassesPage />)} />
          <Route path="/classes/:classId" element={protectedPage(<ClassPage />)} />
          <Route path="/students" element={protectedPage(<StudentsPage />)} />
          <Route path="*" element={<Navigate to="/classes" replace />} />
        </Routes>
      </HashRouter>
      <ToastContainer position="bottom-center" autoClose={2500} />
    </>
  );
}

export default App;
