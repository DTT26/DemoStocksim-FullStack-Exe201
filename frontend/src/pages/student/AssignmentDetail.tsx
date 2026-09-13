import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Target, Play } from 'lucide-react';

export const StudentAssignmentDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/student/assignments" 
          className="p-2 hover:bg-[#2a2e39] rounded-lg text-[#787b86] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Technical Analysis: FPT</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-[#787b86]">
            <span className="bg-amber-50/10 text-amber-500 px-2 py-0.5 rounded text-xs font-medium border border-amber-500/20">
              In Progress
            </span>
            <span>•</span>
            <span>Assigned by Dr. Smith</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Instructions</h2>
            <div className="prose prose-invert max-w-none text-[#787b86] text-sm">
              <p>
                In this assignment, you will apply basic technical analysis concepts to the FPT stock over a simulated 3-month period.
              </p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Identify and trade at least 2 major support/resistance breakouts.</li>
                <li>Use RSI to identify overbought/oversold conditions before entering a position.</li>
                <li>Achieve a minimum profit of 5% on your initial capital.</li>
              </ul>
              <p className="mt-4">
                Make sure to review the provided material on moving averages before starting.
              </p>
            </div>
          </div>

          <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Rules & Constraints</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#131722] rounded-xl border border-[#2a2e39]">
                <div className="text-[#787b86] text-xs font-semibold uppercase mb-1">Initial Capital</div>
                <div className="text-white font-bold font-mono">100,000,000 VND</div>
              </div>
              <div className="p-4 bg-[#131722] rounded-xl border border-[#2a2e39]">
                <div className="text-[#787b86] text-xs font-semibold uppercase mb-1">Allowed Pairs</div>
                <div className="text-white font-bold font-mono">FPT/VND only</div>
              </div>
              <div className="p-4 bg-[#131722] rounded-xl border border-[#2a2e39]">
                <div className="text-[#787b86] text-xs font-semibold uppercase mb-1">Max Leverage</div>
                <div className="text-white font-bold font-mono">1x (Spot only)</div>
              </div>
              <div className="p-4 bg-[#131722] rounded-xl border border-[#2a2e39]">
                <div className="text-[#787b86] text-xs font-semibold uppercase mb-1">Time Limit</div>
                <div className="text-white font-bold font-mono">60 minutes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#1e222d] rounded-2xl border border-[#2a2e39] p-6">
            <h3 className="text-white font-semibold mb-4">Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-white">Simulation Module</div>
                  <div className="text-xs text-[#787b86]">Trading Challenge #01</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-white">Due Date</div>
                  <div className="text-xs text-[#787b86]">September 15, 2026, 23:59</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-white">Estimated Effort</div>
                  <div className="text-xs text-[#787b86]">~1.5 hours</div>
                </div>
              </div>
            </div>

            <hr className="border-[#2a2e39] my-6" />

            <Link 
              to="/trade/sim-01"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Assignment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
