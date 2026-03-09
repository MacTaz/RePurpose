import { Suspense } from 'react'
import ResetPasswordPage from './ResetPasswordPage'

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#2D3561] flex items-center justify-center">
            <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>}>
            <ResetPasswordPage />
        </Suspense>
    )
}
