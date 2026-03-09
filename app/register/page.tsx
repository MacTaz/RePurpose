import { Suspense } from 'react';
import RegisterPage from './RegisterPage';

export default function Page() {
    return (
        <Suspense fallback={<div className="h-screen bg-[#2D3561]" />}>
            <RegisterPage />
        </Suspense>
    )
}