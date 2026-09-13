import { SignUp } from '@clerk/nextjs';

export const metadata = {
  title: 'Create Account — Bazzar',
  description: 'Join Bazzar and start shopping',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F7F7F5] via-white to-[#EEF0FF] px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold tracking-tight text-[#111111]">
            Bazzar
          </span>
          <p className="mt-1 text-sm text-[#6B6B6B]">Create your account to start shopping</p>
        </div>
        <SignUp
          path="/sign-up"
          routing="path"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-xl border border-[#E8E8E8] rounded-2xl',
              headerTitle: 'text-[#111111] font-extrabold',
              formButtonPrimary:
                'bg-[#111111] hover:bg-[#3F46D8] transition-colors font-bold rounded-xl',
              footerActionLink: 'text-[#3F46D8] hover:text-[#111111]',
            },
          }}
        />
      </div>
    </div>
  );
}
