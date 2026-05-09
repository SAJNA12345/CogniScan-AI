import Navbar from "./Navbar";

export default function PageLayout({ children }) {
  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>{children}</div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  container: {
    padding: "40px",
  },
};