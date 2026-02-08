'use client'

import { useActionState } from 'react' // Next.js 15 이상 표준
import { signUp, ActionResponse } from '@/app/actions/auth'

export default function SignUpPage() {
  // state: 서버에서 반환한 결과값 (success, error 등)
  // formAction: <form>의 action에 넣을 함수
  // isPending: 실행 중인지 여부 (로딩 바 처리용)
const initialState: ActionResponse = { success: false, error: null };

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionResponse, formData: FormData): Promise<ActionResponse> => {
      return await signUp(prevState, formData);
    },
    initialState
  );

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
      
      <form action={formAction} className="flex flex-col gap-4">
        <input name="userId" placeholder="아이디" className="border p-2 rounded text-black" required />
        <input name="name" placeholder="이름" className="border p-2 rounded text-black" required />
        <input name="password" type="password" placeholder="비밀번호" className="border p-2 rounded text-black" required />
        
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          {isPending ? '가입 중...' : '가입하기'}
        </button>

        {/* 서버에서 돌아온 에러 메시지 표시 */}
        {state?.error && <p className="text-red-500">{state.error}</p>}
        {state?.success && <p className="text-green-500">가입 성공! 로그인해 주세요.</p>}
      </form>
    </div>
  )
}