'use client'

import { useActionState, useState } from 'react'
import { signUp, ActionResponse } from '@/app/actions/auth'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  const initialState: ActionResponse = { success: false, error: null }

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionResponse, formData: FormData): Promise<ActionResponse> => {
      return await signUp(prevState, formData)
    },
    initialState
  )

  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isDisabled = isPending || !userId.trim() || !name.trim() || !password.trim()

  return (
    <div className="h-full px-8 pb-16 flex items-center justify-center">
      <div className="w-full">

        <h1 className="mb-8 text-3xl font-bold text-gray-900">Sign Up</h1>

        <form action={formAction} className="flex flex-col gap-4">
          <input
            name="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
            className="h-12 w-full rounded-md border border-transparent bg-gray-100 px-4 text-gray-900 outline-none transition focus:border-gray-300 focus:border-2 focus:bg-white"
            required
          />

          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
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
              className="h-12 w-full rounded-md border border-transparent bg-gray-100 px-4 pr-12 text-gray-900 outline-none transition focus:border-gray-300 focus:border-2 focus:bg-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-600 hover:bg-gray-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="mt-2 h-12 w-full rounded-md bg-lime text-base font-semibold text-white transition hover:bg-verde disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isPending ? 'Signing up...' : 'Sign Up'}
          </button>

          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700">
            <ChevronLeft className="inline mr-1" size={16} />
            Login
          </Link>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-600">Sign up complete. Please log in.</p>}
        </form>
      </div>
    </div>
  )
}
