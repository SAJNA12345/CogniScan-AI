import PageLayout from "../components/PageLayout";

export default function Dashboard() {
  return (
    <PageLayout>
      <h2>Dashboard</h2>

      <div style={styles.cards}>
        <div style={styles.card}>🧠 Last Score: 78</div>
        <div style={styles.card}>📊 Risk Level: Low</div>
        <div style={styles.card}>📅 Next Test: Tomorrow</div>
      </div>
    </PageLayout>
  );
}

const styles = {
  cards: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    flex: 1,
  },
};