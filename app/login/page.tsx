'use client'

import { useActionState } from 'react'
import { login, ActionResponse } from '@/app/actions/auth'

export default function LoginPage() {
  const initialState: ActionResponse = { success: false, error: null };
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <input name="userId" placeholder="아이디" className="border p-2 rounded text-black" required />
        <input name="password" type="password" placeholder="비밀번호" className="border p-2 rounded text-black" required />
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-green-500 text-white p-2 rounded"
        >
          {isPending ? '로그인 중...' : '로그인'}
        </button>
        {state.error && <p className="text-red-500">{state.error}</p>}
        {state.success && <p className="text-blue-500">환영합니다! 로그인에 성공했습니다.</p>}
      </form>
    </div>
  )
}