import { Controller } from 'react-hook-form';

export const AdminLoginForm = ({ control, errors, trigger, isSignUp }) => {
  return (
    <div className="form-group">
      <div className="form-outline mb-4">
        <label htmlFor="email">Email address</label>
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Email is required',
            pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Enter a valid email address' },
          }}
          defaultValue=""
          render={({ field }) => (
            <>
              <input
                {...field}
                id="email"
                type="email"
                autoComplete="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                onBlur={() => trigger('email')}
                data-test-specifier="usernameInput"
              />
              {errors.email && <p className="invalid-feedback">{errors.email.message}</p>}
            </>
          )}
        />
      </div>

      <div className="form-outline mb-4">
        <label htmlFor="password">Password</label>
        <Controller
          name="password"
          control={control}
          defaultValue=""
          rules={{
            required: 'Password is required',
            // Mirrors the Supabase Auth password policy (config.toml / dashboard), for a friendlier message
            ...(isSignUp && {
              minLength: { value: 8, message: 'At least 8 characters' },
              pattern: { value: /^(?=.*[A-Za-z])(?=.*\d)/, message: 'Use both letters and numbers' },
            }),
          }}
          render={({ field }) => (
            <>
              <input
                {...field}
                id="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                onBlur={() => trigger('password')}
                data-test-specifier="passwordInput"
              />
              {errors.password && <p className="invalid-feedback">{errors.password.message}</p>}
            </>
          )}
        />
      </div>
    </div>
  );
};
