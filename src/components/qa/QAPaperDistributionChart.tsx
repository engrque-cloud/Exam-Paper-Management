import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useExam } from '../../context/ExamContext';
import { SubjectType } from '../../types';
import { ALL_SUBJECTS, ALL_SEMESTERS } from '../../data/courses';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart2,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Filter,
} from 'lucide-react';

interface QAPaperDistributionChartProps {
  onSelectTab?: (tab: 'pending' | 'approved' | 'rejected') => void;
  onSelectSubject?: (subject: SubjectType | 'All') => void;
}

export const QAPaperDistributionChart: React.FC<QAPaperDistributionChartProps> = ({
  onSelectTab,
  onSelectSubject,
}) => {
  const { papers } = useExam();

  // Visualization display toggle
  const [breakdownView, setBreakdownView] = useState<'department' | 'semester'>('department');
  const [barLayout, setBarLayout] = useState<'stacked' | 'grouped'>('stacked');

  // Calculate Primary Distribution Metrics
  const totalPapers = papers.length;
  const pendingPapers = papers.filter(p => p.status === 'pending_qa').length;
  const moderatedPapers = papers.filter(p => p.status === 'qa_approved').length;
  const rejectedPapers = papers.filter(p => p.status === 'qa_rejected').length;

  const pendingPct = totalPapers > 0 ? Number(((pendingPapers / totalPapers) * 100).toFixed(1)) : 0;
  const moderatedPct = totalPapers > 0 ? Number(((moderatedPapers / totalPapers) * 100).toFixed(1)) : 0;
  const rejectedPct = totalPapers > 0 ? Number(((rejectedPapers / totalPapers) * 100).toFixed(1)) : 0;

  // Donut chart dataset
  const donutData = useMemo(() => {
    if (totalPapers === 0) {
      return [
        { name: 'Pending Review', value: 0, count: 0, color: '#f59e0b' },
        { name: 'Moderated (Approved)', value: 0, count: 0, color: '#10b981' },
        { name: 'Rejected (Needs Revision)', value: 0, count: 0, color: '#f43f5e' },
      ];
    }
    return [
      {
        name: 'Pending Review',
        value: pendingPapers,
        count: pendingPapers,
        percentage: pendingPct,
        color: '#f59e0b',
        key: 'pending',
      },
      {
        name: 'Moderated (Approved)',
        value: moderatedPapers,
        count: moderatedPapers,
        percentage: moderatedPct,
        color: '#10b981',
        key: 'approved',
      },
      {
        name: 'Rejected (Needs Revision)',
        value: rejectedPapers,
        count: rejectedPapers,
        percentage: rejectedPct,
        color: '#f43f5e',
        key: 'rejected',
      },
    ];
  }, [totalPapers, pendingPapers, moderatedPapers, rejectedPapers, pendingPct, moderatedPct, rejectedPct]);

  // Department-wise distribution dataset
  const departmentData = useMemo(() => {
    return ALL_SUBJECTS.map(dept => {
      const deptPapers = papers.filter(p => p.subject === dept);
      const pending = deptPapers.filter(p => p.status === 'pending_qa').length;
      const moderated = deptPapers.filter(p => p.status === 'qa_approved').length;
      const rejected = deptPapers.filter(p => p.status === 'qa_rejected').length;
      const total = deptPapers.length;
      const clearanceRate = total > 0 ? Math.round((moderated / total) * 100) : 0;

      return {
        name: dept,
        shortName: dept.length > 10 ? dept.slice(0, 8) + '..' : dept,
        Pending: pending,
        Moderated: moderated,
        Rejected: rejected,
        Total: total,
        clearanceRate,
      };
    });
  }, [papers]);

  // Semester-wise distribution dataset
  const semesterData = useMemo(() => {
    return ALL_SEMESTERS.map(sem => {
      const semPapers = papers.filter(p => p.semester === sem);
      const pending = semPapers.filter(p => p.status === 'pending_qa').length;
      const moderated = semPapers.filter(p => p.status === 'qa_approved').length;
      const rejected = semPapers.filter(p => p.status === 'qa_rejected').length;
      const total = semPapers.length;

      return {
        name: `Sem ${sem}`,
        Pending: pending,
        Moderated: moderated,
        Rejected: rejected,
        Total: total,
      };
    });
  }, [papers]);

  // Real-time Bottleneck Health Assessment
  const bottleneckStatus = useMemo(() => {
    if (totalPapers === 0) {
      return {
        level: 'neutral',
        title: 'Awaiting Paper Submissions',
        description: 'No examination papers currently submitted by course instructors.',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        textColor: 'text-slate-600',
      };
    }
    if (pendingPapers === 0 && rejectedPapers === 0) {
      return {
        level: 'optimal',
        title: '100% QA Clearance - No Bottlenecks',
        description: 'All submitted question papers are moderated and cleared for date sheet generation.',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        textColor: 'text-emerald-700',
      };
    }
    if (pendingPapers > 5 || (pendingPct > 50 && totalPapers >= 4)) {
      return {
        level: 'high_pending',
        title: 'Review Queue Bottleneck Detected',
        description: `${pendingPapers} papers (${pendingPct}%) are pending scrutiny. Committee review acceleration recommended.`,
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse',
        textColor: 'text-amber-800',
      };
    }
    if (rejectedPapers > 3 || (rejectedPct > 25 && totalPapers >= 4)) {
      return {
        level: 'high_rejected',
        title: 'High Revision Deficiencies Bottleneck',
        description: `${rejectedPapers} papers (${rejectedPct}%) rejected. Faculty formatting/Bloom's calibration needed.`,
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        textColor: 'text-rose-700',
      };
    }
    return {
      level: 'normal',
      title: 'Healthy Moderation Cadence',
      description: `${moderatedPapers} of ${totalPapers} papers moderated (${moderatedPct}% clearance). Low review latency.`,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      textColor: 'text-teal-700',
    };
  }, [totalPapers, pendingPapers, rejectedPapers, moderatedPapers, pendingPct, rejectedPct, moderatedPct]);

  // Department with largest pending queue
  const topPendingDept = useMemo(() => {
    let top = { name: 'None', count: 0 };
    departmentData.forEach(d => {
      if (d.Pending > top.count) {
        top = { name: d.name, count: d.Pending };
      }
    });
    return top;
  }, [departmentData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 space-y-6">
      {/* Header with Title and Real-time Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              QA Committee Bottleneck Telemetry &amp; Paper Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time scrutiny distribution of <span className="font-semibold text-amber-600">Pending</span>,{' '}
            <span className="font-semibold text-emerald-600">Moderated</span>, and{' '}
            <span className="font-semibold text-rose-600">Rejected</span> question papers.
          </p>
        </div>

        {/* Real-time Bottleneck Alert Capsule */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${bottleneckStatus.badgeColor}`}>
          {bottleneckStatus.level === 'optimal' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : bottleneckStatus.level === 'high_pending' ? (
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          ) : bottleneckStatus.level === 'high_rejected' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          )}
          <span>{bottleneckStatus.title}</span>
        </div>
      </div>

      {/* KPI Cards: Pending, Moderated, Rejected */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Submitted Papers */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Submitted</span>
            <span className="p-1 rounded-md bg-white text-slate-600 border border-slate-200 shadow-2xs">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalPapers}</span>
            <span className="text-xs text-slate-500 font-medium">All Depts</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalPapers === 0 ? 'Nil records' : 'Papers registered in system'}
          </div>
        </div>

        {/* Pending QA Papers */}
        <div
          onClick={() => onSelectTab && onSelectTab('pending')}
          className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-300 transition cursor-pointer flex flex-col justify-between group"
          title="Click to view pending queue"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Pending Review</span>
            <span className="p-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs group-hover:scale-105 transition">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-950">{pendingPapers}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
              {pendingPct}%
            </span>
          </div>
          <div className="text-[11px] text-amber-800 mt-1 flex items-center justify-between">
            <span>Awaiting committee inspection</span>
            <span className="text-[10px] font-semibold underline underline-offset-2">Filter &rarr;</span>
          </div>
        </div>

        {/* Moderated / Approved Papers */}
        <div
          onClick={() => onSelectTab && onSelectTab('approved')}
          className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
          title="Click to view approved archive"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Moderated &amp; Approved</span>
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs group-hover:scale-105 transition">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-950">{moderatedPapers}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
              {moderatedPct}%
            </span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-1 flex items-center justify-between">
            <span>Cleared for Date Sheet</span>
            <span className="text-[10px] font-semibold underline underline-offset-2">Filter &rarr;</span>
          </div>
        </div>

        {/* Rejected Papers */}
        <div
          onClick={() => onSelectTab && onSelectTab('rejected')}
          className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 hover:border-rose-300 transition cursor-pointer flex flex-col justify-between group"
          title="Click to view rejected papers awaiting revision"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">Rejected (Revision)</span>
            <span className="p-1 rounded-md bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs group-hover:scale-105 transition">
              <XCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-950">{rejectedPapers}</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-200">
              {rejectedPct}%
            </span>
          </div>
          <div className="text-[11px] text-rose-800 mt-1 flex items-center justify-between">
            <span>Returned to instructor</span>
            <span className="text-[10px] font-semibold underline underline-offset-2">Filter &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Charts Canvas: 2 Columns (Donut Distribution + Departmental/Semester Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Recharts Donut Pie Chart (Distribution) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                <span>Overall Status Proportion</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                Total: {totalPapers}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Percentage of question papers currently at each stage of moderation.
            </p>
          </div>

          {/* Donut Chart Container */}
          <div className="relative h-60 w-full flex items-center justify-center my-2">
            {totalPapers === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                  <PieIcon className="w-7 h-7" />
                </div>
                <p className="text-xs font-bold text-slate-700">No Exam Papers In Queue</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Chart will populate immediately when teachers upload papers for review.
                </p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={4}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {donutData.map(entry => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-800">
                              <p className="font-bold flex items-center gap-1.5" style={{ color: data.color }}>
                                <span>&bull;</span>
                                <span>{data.name}</span>
                              </p>
                              <div className="mt-1 flex items-center justify-between gap-4 text-slate-300">
                                <span>Count:</span>
                                <span className="font-bold text-white">{data.value} papers</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 text-slate-300">
                                <span>Share:</span>
                                <span className="font-bold text-white">{data.percentage}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {moderatedPct}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Cleared
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Interactive Legend Pill Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/80">
            {donutData.map(item => (
              <button
                key={item.name}
                type="button"
                onClick={() => onSelectTab && onSelectTab((item as any).key || 'pending')}
                className="text-left p-2 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 transition text-[11px]"
              >
                <div className="flex items-center gap-1.5 font-bold truncate" style={{ color: item.color }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name.split(' ')[0]}</span>
                </div>
                <div className="font-extrabold text-slate-900 mt-0.5">{item.count} ({item.percentage || 0}%)</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Recharts Bar Chart (Departmental & Semester Breakdown) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span>
                  {breakdownView === 'department'
                    ? 'Bottleneck Analysis by Academic Department'
                    : 'Scrutiny Distribution by Semester'}
                </span>
              </h4>

              {/* View & Layout Toggles */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {/* View Switcher: Dept vs Sem */}
                <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setBreakdownView('department')}
                    className={`px-2 py-1 rounded-md transition ${
                      breakdownView === 'department'
                        ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Depts
                  </button>
                  <button
                    type="button"
                    onClick={() => setBreakdownView('semester')}
                    className={`px-2 py-1 rounded-md transition ${
                      breakdownView === 'semester'
                        ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semesters
                  </button>
                </div>

                {/* Bar Style: Stacked vs Grouped */}
                <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setBarLayout('stacked')}
                    className={`px-2 py-1 rounded-md transition ${
                      barLayout === 'stacked'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Stacked representation"
                  >
                    Stacked
                  </button>
                  <button
                    type="button"
                    onClick={() => setBarLayout('grouped')}
                    className={`px-2 py-1 rounded-md transition ${
                      barLayout === 'grouped'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Side-by-side grouped representation"
                  >
                    Grouped
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Identify which curriculum area has the most backlogged submissions or highest rejection rates.
            </p>
          </div>

          {/* Bar Chart Container */}
          <div className="h-60 w-full my-2">
            {totalPapers === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-slate-200 rounded-xl bg-white">
                <BarChart2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No Distribution Data Yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  Submissions across English, Islamic Studies, Sociology, and Zoology will display here in real-time.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={breakdownView === 'department' ? departmentData : semesterData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey={breakdownView === 'department' ? 'shortName' : 'name'}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg border border-slate-800 space-y-1">
                            <p className="font-extrabold text-white border-b border-slate-700 pb-1">
                              {label}
                            </p>
                            {payload.map((entry: any) => (
                              <div
                                key={entry.name}
                                className="flex items-center justify-between gap-4 text-slate-300"
                              >
                                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                                  <span>&bull;</span>
                                  <span>{entry.name}:</span>
                                </span>
                                <span className="font-bold text-white">{entry.value} papers</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }}
                  />
                  <Bar
                    dataKey="Pending"
                    name="Pending"
                    fill="#f59e0b"
                    stackId={barLayout === 'stacked' ? 'a' : undefined}
                    radius={barLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Moderated"
                    name="Moderated"
                    fill="#10b981"
                    stackId={barLayout === 'stacked' ? 'a' : undefined}
                    radius={barLayout === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Rejected"
                    name="Rejected"
                    fill="#f43f5e"
                    stackId={barLayout === 'stacked' ? 'a' : undefined}
                    radius={barLayout === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Real-time Bottleneck Insights Row */}
          <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-bold text-slate-800">Primary Bottleneck Focus:</span>
              {topPendingDept.count > 0 ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold border border-amber-200">
                  {topPendingDept.name} ({topPendingDept.count} pending)
                </span>
              ) : (
                <span className="text-slate-500">None &bull; Queue cleared</span>
              )}
            </div>

            {/* Quick 1-click Filter to Dept */}
            {topPendingDept.count > 0 && onSelectSubject && (
              <button
                type="button"
                onClick={() => {
                  onSelectSubject(topPendingDept.name as SubjectType);
                  if (onSelectTab) onSelectTab('pending');
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition underline underline-offset-2 cursor-pointer"
              >
                <span>Filter Queue to {topPendingDept.name}</span>
                <span>&rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
