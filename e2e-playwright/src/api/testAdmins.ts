import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

// Test admins are created with the LOCAL stack's secret key, from Node only (never from the browser).
// Refuses to run against anything that isn't the local Supabase stack.
const localStack = () => {
  const status = JSON.parse(
    execFileSync('npx', ['supabase', 'status', '-o', 'json'], { cwd: '..', encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  );
  const host = new URL(status.API_URL).hostname;
  if (host !== '127.0.0.1' && host !== 'localhost') {
    throw new Error(`Refusing to create test users on non-local Supabase (${host})`);
  }
  return status as { API_URL: string; SECRET_KEY: string; PUBLISHABLE_KEY: string };
};

export const ensureConfirmedAdmin = async (email: string, password: string) => {
  const { API_URL, SECRET_KEY } = localStack();
  const admin = createClient(API_URL, SECRET_KEY, { auth: { persistSession: false } });
  const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error && error.code !== 'email_exists') throw error;
};

// A signed-in client for one admin, to set up or clean up data through RLS like the app does
export const signedInClient = async (email: string, password: string) => {
  const { API_URL, PUBLISHABLE_KEY } = localStack();
  const client = createClient(API_URL, PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
};
