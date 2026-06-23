import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Award,
  Activity,
} from "lucide-react";
import Layout from "../components/Layout";
import { Bento, Badge, PageHeading } from "../components/ui";

export default function Progress() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/results", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ FIXED
        },
      });

      const data = await res.json();

      console.log("API DATA:", data); // ✅ debug

      // ✅ ALWAYS ENSURE ARRAY
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setResults([]);
    }
  };

  // ✅ SAFE DATA
  const safeResults = Array.isArray(results) ? results : [];

  const totalTests = safeResults.length;

  const avgScore =
    totalTests > 0
      ? (
          safeResults.reduce((sum, r) => sum + (r.score || 0), 0) /
          totalTests
        ).toFixed(1)
      : 0;

  const latestScore = safeResults[0]?.score || 0;

  const bestScore =
    totalTests > 0 ? Math.max(...safeResults.map((r) => r.score || 0)) : 0;

  // Chart data: oldest → newest so the line reads left-to-right over time.
  const chartData = [...safeResults]
    .reverse()
    .map((r, i) => ({ name: `Test ${i + 1}`, score: r.score || 0 }));

  return (
    <Layout>
      <PageHeading
        icon={<TrendingUp size={22} />}
        title="Progress"
        subtitle="Track how your cognitive test scores trend over time."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Score trend chart spanning two columns */}
        <Bento className="md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink">
              <LineChartIcon size={18} className="text-brand-600" />
              <h3 className="text-base font-semibold">Score Trend</h3>
            </div>
            <Badge tone="brand">{totalTests} tests</Badge>
          </div>

          {totalTests === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Activity size={26} />
              </span>
              <p className="mt-4 font-semibold text-ink">No test data yet</p>
              <p className="mt-1 text-sm text-ink-soft">
                Complete a test and your progress will appear here.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ left: -16, right: 12, top: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e6eaf0",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#14b8a6" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Bento>

        {/* Summary stat cards */}
        <Bento className="flex flex-col justify-center" delay={0.06}>
          <span className="label">Average Score</span>
          <p className="mt-1 text-3xl font-extrabold text-ink">
            {avgScore}
            <span className="text-base font-medium text-ink-faint"> / 100</span>
          </p>
        </Bento>

        <Bento className="flex flex-col justify-center" delay={0.1}>
          <div className="flex items-center gap-2">
            <Award size={16} className="text-brand-600" />
            <span className="label">Best Score</span>
          </div>
          <p className="mt-1 text-3xl font-extrabold text-ink">
            {bestScore}
            <span className="text-base font-medium text-ink-faint"> / 100</span>
          </p>
        </Bento>

        <Bento className="flex flex-col justify-center" delay={0.14}>
          <span className="label">Total Tests</span>
          <p className="mt-1 text-3xl font-extrabold text-ink">{totalTests}</p>
        </Bento>

        <Bento className="flex flex-col justify-center" delay={0.18}>
          <span className="label">Latest Score</span>
          <p className="mt-1 text-3xl font-extrabold text-ink">
            {latestScore}
            <span className="text-base font-medium text-ink-faint"> / 100</span>
          </p>
        </Bento>
      </div>
    </Layout>
  );
}
