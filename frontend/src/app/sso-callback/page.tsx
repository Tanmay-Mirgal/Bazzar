import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] px-4">
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl border border-[#E8E8E8] shadow-sm max-w-sm w-full text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#111111] border-t-transparent" />
        <p className="text-sm font-semibold text-[#111111]">Completing authentication...</p>
        <p className="text-xs text-[#6B6B6B]">Please wait while we redirect you to Bazzar.</p>
      </div>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  );
}
