import Layout from "../components/Layout";
import { Bento, Badge, PageHeading } from "../components/ui";
import { ShieldCheck, Database, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Admin() {
  return (
    <Layout>
      <PageHeading
        icon={<ShieldCheck size={22} />}
        title="Admin"
        subtitle="View anonymized data"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Bento className="rounded-3xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Database size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">Admin Panel</h2>
                <Badge>Anonymized</Badge>
              </div>
              <p className="mt-1 text-ink-soft">View anonymized data</p>
              <div className="mt-3 inline-flex items-center gap-2 text-ink-faint">
                <Lock size={16} />
                <span className="label">Privacy preserved</span>
              </div>
            </div>
          </div>
        </Bento>
      </motion.div>
    </Layout>
  );
}
