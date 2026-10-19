import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TableWrapper } from '../students/Table.styles';
import { useClasses } from './useClasses';

export const ClassesPage = () => {
  const { classes, isLoading, error, createClass, renameClass, deleteClass, isCreating } = useClasses();
  const [newName, setNewName] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (newName.trim()) createClass(newName, { onSuccess: () => setNewName('') });
  };

  const rename = (cls) => {
    const name = window.prompt('New class name', cls.name);
    if (name && name.trim() && name.trim() !== cls.name) renameClass({ id: cls.id, name });
  };

  const remove = (cls) => {
    if (window.confirm(`Delete "${cls.name}"? Its enrollments and grades will be deleted.`)) deleteClass(cls.id);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <TableWrapper>
      <div className="table-header">
        <h2>My Classes</h2>
      </div>

      <form className="table-controls" onSubmit={submit} style={{ display: 'flex', gap: '8px' }}>
        <input
          className="form-control"
          placeholder="New class name"
          maxLength={100}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          data-test-specifier="newClassName"
        />
        <button type="submit" className="btn btn-primary" disabled={!newName.trim() || isCreating}>
          Add Class
        </button>
      </form>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">Class</th>
              <th scope="col">Students</th>
              <th scope="col">Rename</th>
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">No classes yet. Add your first class above.</div>
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id}>
                  <td>
                    <Link to={`/classes/${cls.id}`}>{cls.name}</Link>
                  </td>
                  <td>{cls.enrollments[0]?.count ?? 0}</td>
                  <td>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => rename(cls)}>
                      Rename
                    </button>
                  </td>
                  <td>
                    <button type="button" className="btn btn-outline-danger" onClick={() => remove(cls)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </TableWrapper>
  );
};
