import { useEffect, useState } from "react";
import { BarChart3, Calendar, Brain } from "lucide-react";
import Layout from "../components/Layout";
import { Bento, Badge, ScoreRing, PageHeading } from "../components/ui";

export default function Results() {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/results", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setResults(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🎯 Normalize score
  const normalizeScore = (r: any) =>
    Math.round((r.score / (r.total || 100)) * 100);

  // 🎯 TYPE LABEL
  const getTypeLabel = (type: any) => {
    const t =
      typeof type === "string"
        ? type.toLowerCase()
        : type?.name?.toLowerCase();

    if (t === "cognitive") return "Cognitive";
    if (t === "pattern") return "Pattern";
    if (t === "risk") return "Risk";
    if (t === "functional") return "Functional";

    return "Unknown";
  };

  // 🎨 Badge tone from score (≥70 green, 40–69 amber, <40 red)
  const getTone = (score: number) => {
    if (score >= 70) return "green" as const;
    if (score >= 40) return "amber" as const;
    return "red" as const;
  };

  // 📅 Date formatting
  const formatDate = (value: any) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <PageHeading
        icon={<BarChart3 size={22} />}
        title="Your Results"
        subtitle="A summary of every assessment you've completed."
      />

      {results.length === 0 ? (
        <Bento className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Brain size={26} />
          </span>
          <h3 className="text-lg font-bold text-ink">No results yet</h3>
          <p className="max-w-sm text-sm text-ink-soft">
            Once you complete an assessment, your scores will appear here.
          </p>
        </Bento>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r, index) => {
            const score = normalizeScore(r);
            const date = formatDate(r.createdAt);

            return (
              <Bento
                key={index}
                delay={index * 0.05}
                className="flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="label">Test Type</span>
                    <h3 className="text-lg font-bold text-ink">
                      {getTypeLabel(r.type)}
                    </h3>
                  </div>
                  <Badge tone={getTone(score)}>{score} / 100</Badge>
                </div>

                <div className="flex items-center justify-center py-2">
                  <ScoreRing value={score} size={104} label="Score" />
                </div>

                {date && (
                  <div className="flex items-center gap-2 border-t border-line pt-3 text-sm text-ink-faint">
                    <Calendar size={14} />
                    <span>{date}</span>
                  </div>
                )}
              </Bento>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
