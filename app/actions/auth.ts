'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from 'bcrypt'

export interface ActionResponse {
  success: boolean;
  error: string | null;
}

export async function signUp(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const userId = formData.get('userId') as string
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  try {
    const existingUser = await prisma.user.findUnique({
      where: { userId }
    })

    if (existingUser) {
      // success를 반드시 포함시켜야 합니다.
      return { success: false, error: '이미 존재하는 아이디입니다.' }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        userId,
        name,
        password: hashedPassword,
      },
    })

    return { success: true, error: null }
  } catch (e) {
    console.error(e)
    return { success: false, error: '서버 오류가 발생했습니다.' }
  }
}


export async function login(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const userId = formData.get('userId') as string;
  const password = formData.get('password') as string;

  try {
    // 1. 유저 찾기
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return { success: false, error: '존재하지 않는 아이디입니다.' };
    }

    // 2. 비밀번호 비교 (입력값 vs DB 해시값)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: '비밀번호가 일치하지 않습니다.' };
    }

    // 로그인 성공! (실제로는 여기서 세션이나 쿠키를 설정합니다)
    return { success: true, error: null };
    
  } catch (e) {
    console.error(e);
    return { success: false, error: '로그인 도중 오류가 발생했습니다.' };
  }
}