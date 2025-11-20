import { Outlet } from "react-router-dom";
import DashboardHeader from "../components/layout/DashboardHeader";

export default function DashboardLayout() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white selection:bg-blue-500/30">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/40 via-25% to-[#0a0a0a] to-20% z-10" />

                <div className="absolute inset-0">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={`v-${i}`}
                            className="absolute inset-y-0 w-px bg-gradient-to-b from-white/[0.15] via-white/[0.08] via-10% to-white/0 to-20%"
                            style={{ left: `${i * 15}%` }}
                        />
                    ))}
                </div>

                <div className="absolute inset-0">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={`h-${i}`}
                            className="absolute inset-x-0 h-px bg-gradient-to-r from-white/0 via-white/[0.05] to-white/0"
                            style={{
                                top: `${i * 5.66}%`,
                                opacity: Math.max(0, 1 - (i / 15) * 1.8)
                            }}
                        />
                    ))}
                </div>

                <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-white/30 via-white/15 via-20% to-white/0 to-45%" />

                <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] animate-pulse"
                    style={{ animationDuration: '4s' }} />
                <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-purple-600/8 blur-[100px] animate-pulse"
                    style={{ animationDuration: '6s', animationDelay: '1s' }} />
                <div className="absolute left-1/3 top-40 h-64 w-64 rounded-full bg-cyan-600/6 blur-[80px] animate-pulse"
                    style={{ animationDuration: '5s', animationDelay: '2s' }} />
            </div>

            <DashboardHeader />
            <main className="relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
