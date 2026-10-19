import { createClient } from '@supabase/supabase-js';

// Only the project URL and the publishable key belong in the browser. Every request is still checked by
// Row Level Security in the database; never put a secret/service-role key in a REACT_APP_ variable.
const url = process.env.REACT_APP_SUPABASE_URL;
const publishableKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error('Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_PUBLISHABLE_KEY (see reactApp/.env.example; on Vercel: Settings -> Environment Variables)');
}

export const supabase = createClient(url, publishableKey, {
  // PKCE puts the email-confirmation result in ?code=, which doesn't clash with the HashRouter's #/ routes
  auth: { flowType: 'pkce' },
});

// Turns Supabase/Postgres errors into messages an admin can act on
export const friendlyError = (error) => {
  switch (error?.code) {
    case '23505':
      return 'This already exists.';
    case '23514':
      return 'One of the values is not valid.';
    case '42501':
      return 'You do not have permission to do that.';
    default:
      return error?.message || 'Something went wrong. Please try again.';
  }
};

// Supabase client calls resolve with { data, error } instead of throwing; React Query needs a throw
export const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};
