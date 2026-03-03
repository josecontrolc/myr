import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import ServiceStatusPanel from '../components/ServiceStatusPanel';

const Login = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-5xl w-full grid gap-0 lg:grid-cols-[1.1fr,1.1fr] items-stretch rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.55)] border border-white/10 bg-white/5">
        {/* Left column: brand and login form */}
        <div className="bg-black-purple px-10 py-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  R
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider text-purple-100 uppercase">
                    MyR
                  </p>
                  <p className="text-xs text-purple-200/80">Customer control panel</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-purple-200/70">
                Secure session
              </span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
              <p className="text-sm text-purple-100/80">
                Connect to your MyR space to manage services, tickets, and contracts.
              </p>
            </div>

            <LoginForm onSuccess={handleSuccess} />
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-purple-100/80">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors"
            >
              ← Back to home
            </button>
            <div className="text-sm text-right">
              <span className="mr-1">New to MyR?</span>
              <Link
                to="/register"
                className="font-semibold text-pink-400 hover:text-pink-300 transition-colors"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>

        {/* Right column: hero text and service status */}
        <div className="hidden lg:flex flex-col justify-between text-white bg-gradient-to-b from-[#221547] to-[#120820] px-10 py-10 border-l border-white/10">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/40 mb-4">
                <svg
                  className="w-6 h-6 text-amber-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11c.621 0 1.125-.504 1.125-1.125S12.621 8.75 12 8.75s-1.125.504-1.125 1.125S11.379 11 12 11zm0 2.25v2.5m-7.5.25h15a1 1 0 00.894-1.447l-7.5-15a1 1 0 00-1.788 0l-7.5 15A1 1 0 004.5 15.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold leading-snug mb-2">
                Your secure portal for daily operations
              </h2>
              <p className="text-sm text-purple-100/80 max-w-md">
                Follow the real time status of the platform, open tickets, manage contracts,
                and keep control of your services from a single dashboard.
              </p>
            </div>

            <div className="flex-1 flex flex-col">
              <p className="text-xs font-semibold tracking-wider uppercase text-purple-200 mb-3">
                Platform status
              </p>
              <ServiceStatusPanel />
            </div>

            <div className="mt-6 flex items-center justify-between text-[11px] text-purple-100/70">
              <span>Protected by DMZ architecture and Better Auth.</span>
              <span>Available twenty four seven</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
