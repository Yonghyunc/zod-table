'use client'

import { useActionState, useEffect, useState } from 'react'
import { login, ActionResponse } from '@/app/actions/auth'
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const initialState: ActionResponse = { success: false, error: null }
  const [state, formAction, isPending] = useActionState(login, initialState)
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!state.success) {
      return
    }

    router.replace('/')
  }, [router, state.success])

  const isDisabled = isPending || !userId.trim() || !password.trim()

  return (
    <div className="h-full px-8 pb-16 flex items-center justify-center">
      <div className="w-full">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Login</h1>

        <form action={formAction} className="flex flex-col gap-4">
          <input
            name="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
            className="h-12 w-full rounded-md border border-transparent bg-gray-100 px-4 text-gray-900 outline-none transition focus:border-gray-300 focus:border-2 focus:bg-white"
            required
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 w-full rounded-md border border-transparent bg-gray-100 px-4 pr-12 text-gray-900 outline-none transition focus:border-gray-300 focus:border-2  focus:bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-600 hover:bg-gray-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <Eye />
              ) : (
                <EyeOff />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="mt-2 h-12 w-full rounded-md bg-lime text-base font-semibold text-white transition hover:bg-verde disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>

          <Link href="/signup" className="text-sm font-medium text-gray-500 hover:text-gray-700">Sign up</Link>


          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        </form>

    </div>
      
</div>
  )
}
