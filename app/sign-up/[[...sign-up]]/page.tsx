import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Daftar Sekarang</h1>
                    <p className="text-slate-600">Mulai perjalanan belajar Anda bersama kami</p>
                </div>

                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                            card: "shadow-xl",
                        },
                    }}
                    routing="path"
                    path="/sign-up"
                    signInUrl="https://immune-parrot-55.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fdashboard"
                    afterSignUpUrl="/dashboard"
                />
            </div>
        </div>
    );
}
