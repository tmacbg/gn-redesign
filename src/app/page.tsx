import { redirect } from 'next/navigation';

// Legacy behaviour: the root redirects to the default language.
export default function Root() {
  redirect('/bg');
}
