import { redirect } from 'next/navigation';

export default function Page() {
  const playerName =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('quiz_player_name')
      : null;

  if (!playerName) {
    redirect('/welcome');
  }

  redirect('/quiz');
}
