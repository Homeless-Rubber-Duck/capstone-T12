import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Deny access until Ethan's staff authentication
  // establishes and verifies a real session.
  redirect(303, '/employee/login');
};
