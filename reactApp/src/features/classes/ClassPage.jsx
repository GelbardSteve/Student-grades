import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TableWrapper } from '../students/Table.styles';
import { GradesModal } from './GradesModal';
import { StudentFormModal } from './StudentFormModal';
import { useClass } from './useClasses';
import { useClassRoster } from './useClassRoster';

const gradeSummary = (grades) => grades.map((g) => `${g.subject}: ${Number(g.score)}`).join(', ');

export const ClassPage = () => {
  const { classId } = useParams();
  const { data: cls, isLoading: isClassLoading } = useClass(classId);
  const { roster, isLoading, error, addStudent, updateStudent, removeFromClass, saveGrade, deleteGrade, sendReport } =
    useClassRoster(classId);
  const [modal, setModal] = useState(null); // { type: 'add' | 'edit' | 'grades', studentId? }

  if (isLoading || isClassLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  // RLS returns nothing for a class that doesn't exist or belongs to another admin
  if (!cls) return <div>Class not found. <Link to="/classes">Back to classes</Link></div>;

  const selected = roster.find((s) => s.id === modal?.studentId);
  const close = () => setModal(null);

  const remove = (student) => {
    if (window.confirm(`Remove ${student.name} from ${cls.name}? Their grades in this class will be deleted.`)) {
      removeFromClass.mutate(student.enrollmentId);
    }
  };

  return (
    <TableWrapper>
      <div className="table-header">
        <h2>
          <Link to="/classes">Classes</Link> / {cls.name}
        </h2>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })} data-test-specifier="addStudentButton">
          Add Student
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">Student Number</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Grades</th>
              <th scope="col">Actions</th>
              <th scope="col">Send Grades</th>
              <th scope="col" title="A grade report was emailed">Sent</th>
            </tr>
          </thead>
          <tbody>
            {roster.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">No students in this class yet</div>
                </td>
              </tr>
            ) : (
              roster.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace' }}>{student.student_number}</td>
                  <td>{student.name}</td>
                  <td>{student.email || <span className="text-muted">No email</span>}</td>
                  <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {gradeSummary(student.grades) || <span className="text-muted">No grades</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-outline-primary mr-1" onClick={() => setModal({ type: 'grades', studentId: student.id })}>
                      Grades
                    </button>
                    <button className="btn btn-outline-secondary mr-1" onClick={() => setModal({ type: 'edit', studentId: student.id })}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => remove(student)}>
                      Remove
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-success"
                      disabled={!student.email || student.grades.length === 0 || sendReport.isLoading}
                      title={!student.email ? 'Add an email address first' : student.grades.length === 0 ? 'Add grades first' : 'Email all grades in this class'}
                      onClick={() => sendReport.mutate(student.id)}
                    >
                      {sendReport.isLoading && sendReport.variables === student.id ? 'Sending...' : 'Send Email'}
                    </button>
                  </td>
                  <td>
                    {student.lastSentAt && (
                      <span
                        role="img"
                        aria-label="Grades emailed"
                        title={`Last sent ${new Date(student.lastSentAt).toLocaleString()}`}
                        style={{ color: '#28a745', fontSize: '1.25rem', fontWeight: 'bold' }}
                      >
                        ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal?.type === 'add' && (
        <StudentFormModal
          onClose={close}
          isSaving={addStudent.isLoading}
          onSubmit={(values) => addStudent.mutate(values, { onSuccess: close })}
        />
      )}
      {modal?.type === 'edit' && selected && (
        <StudentFormModal
          student={selected}
          onClose={close}
          isSaving={updateStudent.isLoading}
          onSubmit={({ name, email }) => updateStudent.mutate({ id: selected.id, name, email }, { onSuccess: close })}
        />
      )}
      {modal?.type === 'grades' && selected && (
        <GradesModal student={selected} saveGrade={saveGrade} deleteGrade={deleteGrade} onClose={close} />
      )}
    </TableWrapper>
  );
};
