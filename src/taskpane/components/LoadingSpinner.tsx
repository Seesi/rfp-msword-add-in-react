import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Processing your file, please wait...",
}) => {
  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes rfp-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rfp-spinner {
          animation: rfp-spin 0.85s linear infinite;
          display: block;
        }
      `}</style>

      <svg
        className="rfp-spinner"
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background track */}
        <circle cx="18" cy="18" r="15" stroke="#E2E8F0" strokeWidth="3" fill="none" />
        {/* Spinning arc */}
        <circle
          cx="18"
          cy="18"
          r="15"
          stroke="#2563EB"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="60 94"
        />
      </svg>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    padding: "32px 20px",
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    width: "100%",
  },
  message: {
    margin: 0,
    fontSize: "13px",
    color: "#64748B",
    textAlign: "center",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
};

export default LoadingSpinner;
