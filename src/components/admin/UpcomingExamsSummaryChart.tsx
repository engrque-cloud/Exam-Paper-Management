import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from 'recharts';
import { useExam } from '../../context/ExamContext';
import { SubjectType, SemesterNumber } from '../../types';
import {
  BarChart3,
  PieChart as PieChartIcon,
  GraduationCap,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

type GroupingMode = 'department' | 'difficulty';
type MetricView = 'overview' | 'candidates' | 'readiness';

interface DepartmentData {
  department: string;
  totalExams: number;
  totalCandidates: number;
  papersReady: number;
  papersPending: number;
  morningShift: number;
  eveningShift: number;
  readinessRate: number;
  courseCodes: string[];
}

interface DifficultyData {
  difficulty: string;
  tierLabel: string;
  description: string;
  semesters: string;
  totalExams: number;
  totalCandidates: number;
  papersReady: number;
  papersPending: number;
  avgCandidates: number;
  courseCodes: string[];
}

const TIER_COLORS = {
  Foundation: '#10b981', // Emerald
  Intermediate: '#0284c7', // Sky Blue
  Advanced: '#8b5cf6', // Violet
  Capstone: '#f59e0b', // Amber
};

const DEPARTMENT_COLORS: Record<string, string> = {
  English: '#059669',
  'Islamic Studies': '#0284c7',
  Sociology: '#8b5cf6',
  Zoology: '#d97706',
  Chemistry: '#e11d48',
};

export const UpcomingExamsSummaryChart: React.FC = () => {
  const { dateSheetRows, papers, courses, subjects, autoScheduleAllCoursesDateSheet } = useExam();

  const [groupingMode, setGroupingMode] = useState<GroupingMode>('department');
  const [metricView, setMetricView] = useState<MetricView>('overview');
  const [shiftFilter, setShiftFilter] = useState<'All' | 'Morning Shift' | 'Evening Shift'>('All');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedBarItem, setSelectedBarItem] = useState<string | null>(null);

  // Filter dateSheetRows by shift if specified
  const filteredRows = useMemo(() => {
    return dateSheetRows.filter(row => {
      if (shiftFilter === 'All') return true;
      return row.shift === shiftFilter;
    });
  }, [dateSheetRows, shiftFilter]);

  // 1. Group Upcoming Exams by Department
  const departmentData = useMemo<DepartmentData[]>(() => {
    const map = new Map<string, DepartmentData>();

    // Seed all active subjects
    subjects.forEach(sub => {
      map.set(sub, {
        department: sub,
        totalExams: 0,
        totalCandidates: 0,
        papersReady: 0,
        papersPending: 0,
        morningShift: 0,
        eveningShift: 0,
        readinessRate: 0,
        courseCodes: [],
      });
    });

    filteredRows.forEach(row => {
      const current = map.get(row.subject) || {
        department: row.subject,
        totalExams: 0,
        totalCandidates: 0,
        papersReady: 0,
        papersPending: 0,
        morningShift: 0,
        eveningShift: 0,
        readinessRate: 0,
        courseCodes: [],
      };

      current.totalExams += 1;
      current.totalCandidates += row.totalCandidates || 65;
      if (row.shift === 'Morning Shift') current.morningShift += 1;
      else current.eveningShift += 1;

      const matchingPaper = papers.find(p => p.courseCode === row.courseCode);
      const isReady = !!(matchingPaper && (matchingPaper.status === 'qa_approved' || matchingPaper.file));
      if (isReady) current.papersReady += 1;
      else current.papersPending += 1;

      if (!current.courseCodes.includes(row.courseCode)) {
        current.courseCodes.push(row.courseCode);
      }

      map.set(row.subject, current);
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      readinessRate: item.totalExams > 0 ? Math.round((item.papersReady / item.totalExams) * 100) : 0,
    }));
  }, [subjects, filteredRows, papers]);

  // 2. Group Upcoming Exams by Difficulty Level / Academic Tier
  // Tier 1: Foundation / Introductory (Semesters 1-2)
  // Tier 2: Intermediate / Core Discipline (Semesters 3-4)
  // Tier 3: Advanced Discipline (Semesters 5-6)
  // Tier 4: Capstone / Honors Research (Semesters 7-8)
  const difficultyData = useMemo<DifficultyData[]>(() => {
    const tiers: Record<string, DifficultyData> = {
      Foundation: {
        difficulty: 'Foundation',
        tierLabel: 'Tier 1: Foundation',
        description: 'Introductory Knowledge & Core Basics',
        semesters: 'Semesters 1 & 2 (100-Level)',
        totalExams: 0,
        totalCandidates: 0,
        papersReady: 0,
        papersPending: 0,
        avgCandidates: 0,
        courseCodes: [],
      },
      Intermediate: {
        difficulty: 'Intermediate',
        tierLabel: 'Tier 2: Intermediate',
        description: 'Analytical Methods & Discipline Labs',
        semesters: 'Semesters 3 & 4 (200/300-Level)',
        totalExams: 0,
        totalCandidates: 0,
        papersReady: 0,
        papersPending: 0,
        avgCandidates: 0,
        courseCodes: [],
      },
      Advanced: {
        difficulty: 'Advanced',
        tierLabel: 'Tier 3: Advanced',
        description: 'Thematic Seminars & Specialized Rigor',
        semesters: 'Semesters 5 & 6 (400/500-Level)',
        totalExams: 0,
        totalCandidates: 0,
        papersReady: 0,
        papersPending: 0,
        avgCandidates: 0,
        courseCodes: [],
      },
      Capstone: {
        difficulty: 'Capstone',
        tierLabel: 'Tier 4: Capstone',
        description: 'Comprehensive Synthesis & Research',
        semesters: 'Semesters 7 & 8 (600/700-Level)',
        totalExams: 0,
        totalCandidates: 0,
        papersReady: 0,
        papersPending: 0,
        avgCandidates: 0,
        courseCodes: [],
      },
    };

    filteredRows.forEach(row => {
      const sem = Number(row.semester);
      let tierKey = 'Foundation';
      if (sem <= 2) tierKey = 'Foundation';
      else if (sem <= 4) tierKey = 'Intermediate';
      else if (sem <= 6) tierKey = 'Advanced';
      else tierKey = 'Capstone';

      const tier = tiers[tierKey];
      tier.totalExams += 1;
      tier.totalCandidates += row.totalCandidates || 65;

      const matchingPaper = papers.find(p => p.courseCode === row.courseCode);
      const isReady = !!(matchingPaper && (matchingPaper.status === 'qa_approved' || matchingPaper.file));
      if (isReady) tier.papersReady += 1;
      else tier.papersPending += 1;

      if (!tier.courseCodes.includes(row.courseCode)) {
        tier.courseCodes.push(row.courseCode);
      }
    });

    return Object.values(tiers).map(t => ({
      ...t,
      avgCandidates: t.totalExams > 0 ? Math.round(t.totalCandidates / t.totalExams) : 0,
    }));
  }, [filteredRows, papers]);

  // Overall aggregate stats
  const totalUpcomingExams = filteredRows.length;
  const totalUpcomingCandidates = filteredRows.reduce((sum, r) => sum + (r.totalCandidates || 65), 0);
  const totalPapersReady = filteredRows.filter(r => {
    const p = papers.find(pap => pap.courseCode === r.courseCode);
    return !!(p && (p.status === 'qa_approved' || p.file));
  }).length;
  const overallReadinessRate = totalUpcomingExams > 0 ? Math.round((totalPapersReady / totalUpcomingExams) * 100) : 0;

  // Selected item breakdown list for inspect card
  const selectedCourseRows = useMemo(() => {
    if (!selectedBarItem) return [];
    if (groupingMode === 'department') {
      return filteredRows.filter(r => r.subject === selectedBarItem);
    } else {
      return filteredRows.filter(r => {
        const sem = Number(r.semester);
        if (selectedBarItem === 'Foundation') return sem <= 2;
        if (selectedBarItem === 'Intermediate') return sem === 3 || sem === 4;
        if (selectedBarItem === 'Advanced') return sem === 5 || sem === 6;
        if (selectedBarItem === 'Capstone') return sem >= 7;
        return false;
      });
    }
  }, [selectedBarItem, groupingMode, filteredRows]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-xs text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[210px] space-y-2">
          <div className="border-b border-slate-700/80 pb-1.5">
            <span className="font-bold text-sm text-emerald-400 block">{label}</span>
            <span className="text-[10px] text-slate-400">
              {groupingMode === 'department' ? 'Academic Department' : 'Difficulty Tier Level'}
            </span>
          </div>

          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-bold tabular-nums text-white">{entry.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 italic">
            Click bar to inspect specific courses
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-6">
      {/* 1. Header with Title, Grouping Mode Switcher & Expand Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800">
              Examination Telemetry &amp; Capacity
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Recharts Analytics Engine</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2.5 mt-0.5">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Upcoming Examination Distribution Summary
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Summary chart plotting upcoming scheduled examinations grouped by academic department or curriculum difficulty tier, including student candidate load and paper certification readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Grouping Dimension Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              id="chart-group-department"
              onClick={() => {
                setGroupingMode('department');
                setSelectedBarItem(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                groupingMode === 'department'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>By Department</span>
            </button>

            <button
              type="button"
              id="chart-group-difficulty"
              onClick={() => {
                setGroupingMode('difficulty');
                setSelectedBarItem(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                groupingMode === 'difficulty'
                  ? 'bg-white text-emerald-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>By Difficulty Level</span>
            </button>
          </div>

          {/* Shift Filter Dropdown */}
          <select
            value={shiftFilter}
            onChange={e => setShiftFilter(e.target.value as any)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="All">All Shifts</option>
            <option value="Morning Shift">Morning Shift</option>
            <option value="Evening Shift">Evening Shift</option>
          </select>

          {/* Minimize / Maximize Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
            title={isExpanded ? 'Collapse Chart' : 'Expand Chart'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Row (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Total Scheduled Exams</span>
            <span className="text-2xl font-black text-slate-900 tabular-nums block mt-0.5">
              {totalUpcomingExams}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">In active date sheet</span>
          </div>
          <Clock className="w-7 h-7 text-emerald-500/40" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Total Candidates</span>
            <span className="text-2xl font-black text-slate-900 tabular-nums block mt-0.5">
              {totalUpcomingCandidates}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Enrolled across halls</span>
          </div>
          <Users className="w-7 h-7 text-indigo-500/40" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Paper Readiness</span>
            <span className="text-2xl font-black text-teal-800 tabular-nums block mt-0.5">
              {overallReadinessRate}%
            </span>
            <span className="text-[10px] text-teal-700 font-medium">
              {totalPapersReady} of {totalUpcomingExams} certified
            </span>
          </div>
          <CheckCircle2 className="w-7 h-7 text-teal-500/40" />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              {groupingMode === 'department' ? 'Top Volume Dept' : 'Top Rigor Tier'}
            </span>
            <span className="text-base font-bold text-slate-900 block truncate mt-0.5">
              {groupingMode === 'department'
                ? departmentData.reduce((prev, curr) => (curr.totalExams > prev.totalExams ? curr : prev), departmentData[0])?.department || 'English'
                : difficultyData.reduce((prev, curr) => (curr.totalExams > prev.totalExams ? curr : prev), difficultyData[0])?.tierLabel || 'Foundation'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Highest session density</span>
          </div>
          <TrendingUp className="w-7 h-7 text-amber-500/40" />
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 3. Empty State if no exams are scheduled */}
          {totalUpcomingExams === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-700">No Upcoming Exams Found in Date Sheet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click below to auto-schedule examination dates for all curriculum courses and generate instant visualization telemetry.
                </p>
              </div>
              <button
                type="button"
                onClick={() => autoScheduleAllCoursesDateSheet()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Schedule All Curriculum Courses</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Chart Area (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Metric View Tabs */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">Metric View:</span>
                    <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setMetricView('overview')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                          metricView === 'overview'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Exams &amp; Readiness
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetricView('candidates')}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                          metricView === 'candidates'
                            ? 'bg-white text-slate-900 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Candidates Volume
                      </button>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Interactive chart &bull; Hover or click bar for breakdown
                  </span>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* (A) GROUP BY DEPARTMENT BAR CHART                             */}
                {/* ------------------------------------------------------------- */}
                {groupingMode === 'department' && (
                  <div className="h-[320px] w-full bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      {metricView === 'overview' ? (
                        <BarChart
                          data={departmentData}
                          margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                          onClick={state => {
                            if (state && state.activeLabel) {
                              setSelectedBarItem(state.activeLabel);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="department"
                            tick={{ fill: '#475569', fontSize: 11 }}
                            axisLine={{ stroke: '#cbd5e1' }}
                          />
                          <YAxis tick={{ fill: '#475569', fontSize: 11 }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                            iconType="circle"
                          />
                          <Bar
                            dataKey="totalExams"
                            fill="#059669"
                            name="Scheduled Exams"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                          />
                          <Bar
                            dataKey="papersReady"
                            fill="#0d9488"
                            name="Papers Certified"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                          />
                          <Bar
                            dataKey="papersPending"
                            fill="#f59e0b"
                            name="Papers Pending"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                          />
                        </BarChart>
                      ) : (
                        <BarChart
                          data={departmentData}
                          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                          onClick={state => {
                            if (state && state.activeLabel) {
                              setSelectedBarItem(state.activeLabel);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="department"
                            tick={{ fill: '#475569', fontSize: 11 }}
                            axisLine={{ stroke: '#cbd5e1' }}
                          />
                          <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                            iconType="circle"
                          />
                          <Bar
                            dataKey="totalCandidates"
                            fill="#4f46e5"
                            name="Registered Student Candidates"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* (B) GROUP BY DIFFICULTY LEVEL / ACADEMIC TIER BAR CHART       */}
                {/* ------------------------------------------------------------- */}
                {groupingMode === 'difficulty' && (
                  <div className="h-[320px] w-full bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      {metricView === 'overview' ? (
                        <BarChart
                          data={difficultyData}
                          margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                          onClick={state => {
                            if (state && state.activeLabel) {
                              setSelectedBarItem(state.activeLabel);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="tierLabel"
                            tick={{ fill: '#475569', fontSize: 11 }}
                            axisLine={{ stroke: '#cbd5e1' }}
                          />
                          <YAxis tick={{ fill: '#475569', fontSize: 11 }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                            iconType="circle"
                          />
                          <Bar
                            dataKey="totalExams"
                            fill="#0284c7"
                            name="Scheduled Exams"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                          />
                          <Bar
                            dataKey="papersReady"
                            fill="#10b981"
                            name="Papers Certified"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                          />
                          <Bar
                            dataKey="papersPending"
                            fill="#f59e0b"
                            name="Papers Pending"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                          />
                        </BarChart>
                      ) : (
                        <BarChart
                          data={difficultyData}
                          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                          onClick={state => {
                            if (state && state.activeLabel) {
                              setSelectedBarItem(state.activeLabel);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis
                            dataKey="tierLabel"
                            tick={{ fill: '#475569', fontSize: 11 }}
                            axisLine={{ stroke: '#cbd5e1' }}
                          />
                          <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                            iconType="circle"
                          />
                          <Bar
                            dataKey="totalCandidates"
                            fill="#8b5cf6"
                            name="Total Candidates"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                          />
                          <Bar
                            dataKey="avgCandidates"
                            fill="#3b82f6"
                            name="Avg Candidates per Exam"
                            radius={[6, 6, 0, 0]}
                            cursor="pointer"
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Right Side: Proportional Pie / Donut Chart & Category Breakdown (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <PieChartIcon className="w-3.5 h-3.5 text-indigo-600" />
                      {groupingMode === 'department' ? 'Exams by Department' : 'Exams by Difficulty Tier'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Distribution</span>
                  </div>

                  {/* Donut Chart */}
                  <div className="h-[170px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={groupingMode === 'department' ? departmentData : difficultyData}
                          dataKey="totalExams"
                          nameKey={groupingMode === 'department' ? 'department' : 'difficulty'}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          cursor="pointer"
                          onClick={(entry: any) => {
                            if (entry && entry.name) {
                              setSelectedBarItem(entry.name);
                            }
                          }}
                        >
                          {groupingMode === 'department'
                            ? departmentData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={DEPARTMENT_COLORS[entry.department] || '#64748b'}
                                />
                              ))
                            : difficultyData.map((entry, index) => (
                                <Cell
                                  key={`cell-diff-${index}`}
                                  fill={(TIER_COLORS as any)[entry.difficulty] || '#64748b'}
                                />
                              ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend Pill Cards */}
                  <div className="space-y-1.5 text-xs">
                    {(groupingMode === 'department' ? departmentData : difficultyData).map(item => {
                      const name = groupingMode === 'department' ? (item as DepartmentData).department : (item as DifficultyData).difficulty;
                      const count = item.totalExams;
                      const percentage = totalUpcomingExams > 0 ? Math.round((count / totalUpcomingExams) * 100) : 0;
                      const color =
                        groupingMode === 'department'
                          ? DEPARTMENT_COLORS[name] || '#64748b'
                          : (TIER_COLORS as any)[name] || '#64748b';

                      const isSelected = selectedBarItem === name;

                      return (
                        <div
                          key={name}
                          onClick={() => setSelectedBarItem(isSelected ? null : name)}
                          className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-400'
                              : 'bg-white/80 border-slate-200/70 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-semibold text-slate-800 truncate text-[11px]">
                              {groupingMode === 'difficulty' ? (item as DifficultyData).tierLabel : name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-slate-600">
                            <span className="font-bold tabular-nums text-slate-900 text-[11px]">
                              {count} exams
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Clicked Category Drill-Down Details Table */}
          {selectedBarItem && selectedCourseRows.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-emerald-950 uppercase tracking-wider">
                    Drill-Down Inspection:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-xs">
                    {selectedBarItem} ({selectedCourseRows.length} Scheduled Courses)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBarItem(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Clear Selection &times;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {selectedCourseRows.map(row => {
                  const paper = papers.find(p => p.courseCode === row.courseCode);
                  const isPaperReady = !!(paper && (paper.status === 'qa_approved' || paper.file));

                  return (
                    <div
                      key={row.id}
                      className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-emerald-900">
                          {row.courseCode}
                        </span>
                        {isPaperReady ? (
                          <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                            Ready
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate" title={row.courseTitle}>
                        {row.courseTitle}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span>{row.examDate}</span>
                        <span>{row.shift === 'Morning Shift' ? 'Morning (9am)' : 'Evening (2pm)'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
