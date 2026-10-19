import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pagination } from '../../components/Pagination/Pagination';
import { SearchInput } from '../../components/Search/Search';
import { StudentFormModal } from '../classes/StudentFormModal';
import { TableWrapper } from './Table.styles';
import { useStudents } from './useStudents';

const ITEMS_PER_PAGE = 10;

// Every student the admin has, across classes
export const StudentsPage = () => {
  const { students, isLoading, error, updateStudent, deleteStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return students.filter((s) => s.name.toLowerCase().includes(term) || s.student_number.includes(term));
  }, [students, searchTerm]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, pageCount);
  const pageItems = filtered.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  const remove = (student) => {
    if (window.confirm(`Delete ${student.name}? They will be removed from all classes, with their grades.`)) {
      deleteStudent.mutate(student.id);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    // Grow with the rows: the default fixed height leaves the table squeezed under the search and pagination
    <TableWrapper style={{ '--table-height': 'auto' }}>
      <div className="table-header">
        <h2>All Students</h2>
      </div>

      <div className="table-controls">
        <SearchInput
          value={searchTerm}
          onSearchChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          isDisabled={false}
          totalResults={students.length}
          filteredResults={filtered.length}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">Student Number</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Classes</th>
              <th scope="col">Edit</th>
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">No students found. Add students from a class page.</div>
                </td>
              </tr>
            ) : (
              pageItems.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace' }}>{student.student_number}</td>
                  <td>{student.name}</td>
                  <td>{student.email || <span className="text-muted">No email</span>}</td>
                  <td>
                    {student.classes.map((c, i) => (
                      <span key={c.id}>
                        {i > 0 && ', '}
                        <Link to={`/classes/${c.id}`}>{c.name}</Link>
                      </span>
                    ))}
                  </td>
                  <td>
                    <button className="btn btn-outline-secondary" onClick={() => setEditing(student)}>
                      Edit
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-outline-danger" onClick={() => remove(student)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <Pagination
          numberOfRows={ITEMS_PER_PAGE}
          currentPage={activePage}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
        />
      </div>

      {editing && (
        <StudentFormModal
          student={editing}
          onClose={() => setEditing(null)}
          isSaving={updateStudent.isLoading}
          onSubmit={({ name, email }) =>
            updateStudent.mutate({ id: editing.id, name, email }, { onSuccess: () => setEditing(null) })
          }
        />
      )}
    </TableWrapper>
  );
};
