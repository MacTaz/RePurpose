import Link from 'next/link'

export default async function ErrorPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const { message } = await searchParams
    const displayMessage = message || "Sorry, something went wrong"

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-2xl font-bold text-slate-800 mb-4">Signup Issue</h1>
                <p className="text-slate-600 mb-8 italic">"{displayMessage}"</p>

                {displayMessage.toLowerCase().includes("rate limit") && (
                    <p className="text-sm text-slate-400 mb-8">
                        Note: Supabase has a rate limit for signups. Please wait a few minutes before trying again with the same email.
                    </p>
                )}

                <div className="flex flex-col gap-3">
                    <Link
                        href="/register"
                        className="bg-[#647BD0] text-white font-bold py-3 rounded-xl hover:bg-[#4f63b0] transition-colors"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
