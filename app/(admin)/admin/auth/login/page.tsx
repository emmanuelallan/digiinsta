import { LoginForm } from "@/components/admin/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <LoginForm />
      </div>

      {/* Right side - Decorative */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />

        {/* Decorative shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-white/10 rounded-full blur-lg" />
        <div className="absolute bottom-32 left-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-white/10 rounded-full blur-lg" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md px-8 py-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <blockquote className="text-white text-lg leading-relaxed">
              &quot;Secure admin access with modern authentication. Built for administrators who need reliable and fast
              access to their dashboard.&quot;
            </blockquote>
            <div className="mt-4 flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
              <div className="ml-3">
                <div className="text-white font-medium">Admin Team</div>
                <div className="text-white/70 text-sm">System Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
