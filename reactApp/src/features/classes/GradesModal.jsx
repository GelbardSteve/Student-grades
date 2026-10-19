import { useState } from 'react';
import { CustomModal } from '../../components/Modal/Modal';
import { ModalForm } from '../students/StudentModal.styles';

const EMPTY = { subject: '', score: '', comment: '' };

const isValidGrade = ({ subject, score }) =>
  subject.trim().length > 0 && score !== '' && Number(score) >= 0 && Number(score) <= 100;

// One grade per subject, score 0-100 (also enforced by the database)
export const GradesModal = ({ student, saveGrade, deleteGrade, onClose }) => {
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const startEdit = (grade) => {
    setEditingId(grade.id);
    setDraft({ subject: grade.subject, score: String(grade.score), comment: grade.comment ?? '' });
  };

  const reset = () => {
    setEditingId(null);
    setDraft(EMPTY);
  };

  const submit = (e) => {
    e.preventDefault();
    saveGrade.mutate({ id: editingId, enrollmentId: student.enrollmentId, ...draft }, { onSuccess: reset });
  };

  const remove = (grade) => {
    if (window.confirm(`Delete the ${grade.subject} grade?`)) deleteGrade.mutate(grade.id);
  };

  return (
    <CustomModal isModalOpen handleCloseTheModal={onClose} header={`Grades: ${student.name}`}>
      <ModalForm>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Score</th>
              <th>Comment</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {student.grades.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted">No grades yet</td>
              </tr>
            )}
            {student.grades.map((grade) => (
              <tr key={grade.id}>
                <td>{grade.subject}</td>
                <td>{Number(grade.score)}</td>
                <td>{grade.comment}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button type="button" className="btn btn-sm btn-outline-secondary mr-1" onClick={() => startEdit(grade)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(grade)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={submit}>
          <h3 style={{ fontSize: '1rem' }}>{editingId ? 'Edit grade' : 'Add grade'}</h3>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              maxLength={100}
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="score">Score (0-100)</label>
            <input
              id="score"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={draft.score}
              onChange={(e) => setDraft({ ...draft, score: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="comment">Comment (optional)</label>
            <textarea
              id="comment"
              maxLength={2000}
              value={draft.comment}
              onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
            />
          </div>
          <div className="form-actions">
            {editingId ? (
              <button type="button" className="btn-secondary" onClick={reset}>
                Cancel edit
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={onClose}>
                Close
              </button>
            )}
            <button type="submit" className="btn-success" disabled={!isValidGrade(draft) || saveGrade.isLoading}>
              {saveGrade.isLoading ? 'Saving...' : editingId ? 'Save grade' : 'Add grade'}
            </button>
          </div>
        </form>
      </ModalForm>
    </CustomModal>
  );
};
