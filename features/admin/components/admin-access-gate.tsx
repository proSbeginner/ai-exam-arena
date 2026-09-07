import type { SubmitEvent } from 'react';
import { TextInput } from '@/features/shared/components/text-input';

interface AdminAccessGateProps {
  email: string;
  error: string | null;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
}

export function AdminAccessGate({ email, error, isLoading, onEmailChange, onSubmit }: AdminAccessGateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
      <form autoComplete="off" onSubmit={onSubmit} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-black text-gray-800">Admin Question Bank</h1>
        <p className="text-sm text-gray-500">กรุณาระบุ Admin email</p>
        <TextInput id="admin-email" name="adminEmail" type="email" autoComplete="off" value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="ADMIN_EMAIL" error={error} />
        <button type="submit" disabled={isLoading} className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white disabled:opacity-50">
          {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ Admin'}
        </button>
      </form>
    </main>
  );
}
