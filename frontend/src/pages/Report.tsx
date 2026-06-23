import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Download, User, BarChart3, TrendingUp, Lightbulb, Brain } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Layout from "../components/Layout";
import { Bento, Button, Badge, PageHeading } from "../components/ui";
import { apiGet } from "../lib/api";

export default function Report() {
  const [results, setResults] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const data = await apiGet("/api/results");
    setResults(Array.isArray(data) ? data : []);
  };

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const avg =
    results.length > 0
      ? results.reduce((a, b) => a + (b.score || 0), 0) / results.length
      : 0;

  let risk = "Low";
  if (avg < 40) risk = "High";
  else if (avg < 70) risk = "Moderate";

  const riskTone: "red" | "amber" | "green" =
    risk === "High" ? "red" : risk === "Moderate" ? "amber" : "green";

  const suggestions = [
    "Practice memory exercises daily",
    "Maintain a healthy sleep cycle",
    "Engage in reading and problem solving",
    "Stay socially active",
  ];

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("CogniScan_Report.pdf");
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading
          icon={<FileText size={22} />}
          title="Medical Report"
          subtitle="Cognitive & speech analysis summary"
        />
        <Button onClick={downloadPDF} className="self-start">
          <Download size={16} /> Download PDF
        </Button>
      </div>

      <Bento>
        <div ref={reportRef} className="rounded-3xl bg-white p-2 text-ink">
          {/* HEADER */}
          <div className="mb-6 flex items-center gap-3 border-b border-line pb-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Brain size={24} />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-ink">
                CogniScan AI
              </h1>
              <p className="text-sm text-ink-soft">
                Cognitive &amp; Speech Analysis Report
              </p>
            </div>
          </div>

          {/* USER DETAILS */}
          <section className="mb-8">
            <h3 className="label mb-3 flex items-center gap-2 text-ink-soft">
              <User size={15} className="text-brand-600" /> User Details
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-bg p-3">
                <p className="label text-ink-faint">Name</p>
                <p className="font-semibold text-ink">{user?.name}</p>
              </div>
              <div className="rounded-2xl border border-line bg-bg p-3">
                <p className="label text-ink-faint">Email</p>
                <p className="font-semibold text-ink">{user?.email}</p>
              </div>
              <div className="rounded-2xl border border-line bg-bg p-3">
                <p className="label text-ink-faint">Date</p>
                <p className="font-semibold text-ink">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>

          {/* TEST HISTORY */}
          <section className="mb-8">
            <h3 className="label mb-3 flex items-center gap-2 text-ink-soft">
              <BarChart3 size={15} className="text-brand-600" /> Test History
            </h3>

            {results.length === 0 ? (
              <p className="text-sm text-ink-faint">No test data available</p>
            ) : (
              <div className="flex flex-col gap-2">
                {results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between rounded-2xl border border-line bg-bg px-4 py-3"
                  >
                    <span className="text-sm font-medium text-ink-soft">
                      {r.type?.toUpperCase() || "TEST"}
                    </span>
                    <span className="font-bold text-brand-600">
                      {r.score}/100
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* ANALYSIS */}
          <section className="mb-8">
            <h3 className="label mb-3 flex items-center gap-2 text-ink-soft">
              <TrendingUp size={15} className="text-brand-600" /> Final Analysis
            </h3>

            <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
              <div>
                <p className="label text-ink-faint">Average Score</p>
                <p className="text-2xl font-extrabold text-ink">
                  {avg.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="label mb-1 text-ink-faint">Risk Level</p>
                <Badge tone={riskTone}>{risk}</Badge>
              </div>
            </div>
          </section>

          {/* SUGGESTIONS */}
          <section className="mb-6">
            <h3 className="label mb-3 flex items-center gap-2 text-ink-soft">
              <Lightbulb size={15} className="text-brand-600" /> Suggestions
            </h3>

            <ul className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-ink-soft"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {/* FOOTER */}
          <div className="border-t border-line pt-4 text-center text-xs text-ink-faint">
            Generated by CogniScan AI
          </div>
        </div>
      </Bento>
    </Layout>
  );
}
