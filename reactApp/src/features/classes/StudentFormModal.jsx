import { Controller, useForm } from 'react-hook-form';
import { CustomModal } from '../../components/Modal/Modal';
import { ModalForm } from '../students/StudentModal.styles';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Add a student (number, name, email) or edit one. The student number is fixed after creation;
// the database enforces that too, the read-only field just makes it clear.
export const StudentFormModal = ({ student, onSubmit, onClose, isSaving }) => {
  const isEdit = Boolean(student);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      student_number: student?.student_number ?? '',
      name: student?.name ?? '',
      email: student?.email ?? '',
    },
  });

  const field = (name, label, rules, inputProps) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: f }) => (
          <>
            <input {...f} id={name} className={errors[name] ? 'error' : ''} {...inputProps} />
            {errors[name] && <div className="error-message">{errors[name].message}</div>}
          </>
        )}
      />
    </div>
  );

  return (
    <CustomModal isModalOpen handleCloseTheModal={onClose} header={isEdit ? 'Edit Student' : 'Add Student'}>
      <ModalForm>
        <form onSubmit={handleSubmit((values) => onSubmit({ ...values, name: values.name.trim(), email: values.email.trim() }))}>
          {field(
            'student_number',
            'Student Number',
            isEdit ? {} : { required: 'Student number is required', pattern: { value: /^\d{1,20}$/, message: 'Digits only (up to 20)' } },
            { readOnly: isEdit, inputMode: 'numeric', placeholder: 'e.g. 1001' }
          )}
          {isEdit ? (
            <small className="text-muted">Student number cannot be changed</small>
          ) : (
            <small className="text-muted">If you already have a student with this number, they are added to this class.</small>
          )}
          {field(
            'name',
            'Student Name',
            { required: 'Name is required', validate: (v) => v.trim().length > 0 || 'Name is required', maxLength: { value: 100, message: 'Up to 100 characters' } },
            { placeholder: 'Full name' }
          )}
          {field(
            'email',
            'Email (optional)',
            { validate: (v) => !v.trim() || EMAIL.test(v.trim()) || 'Enter a valid email address' },
            { type: 'email', placeholder: 'student@example.com' }
          )}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-success" disabled={!isValid || isSaving}>
              {isSaving ? 'Saving...' : isEdit ? 'Save' : 'Add Student'}
            </button>
          </div>
        </form>
      </ModalForm>
    </CustomModal>
  );
};
