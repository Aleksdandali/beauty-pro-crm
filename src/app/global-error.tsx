"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          padding: "1rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          <div style={{
            maxWidth: "600px",
            width: "100%",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#dc2626",
              marginBottom: "1rem",
            }}>
              ⚠️ Something went wrong!
            </h2>
            
            <div style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
            }}>
              <p style={{
                fontSize: "0.875rem",
                color: "#991b1b",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}>
                Error Message:
              </p>
              <pre style={{
                fontSize: "0.875rem",
                color: "#7f1d1d",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
              }}>
                {error.message || "Unknown error"}
              </pre>
            </div>

            {error.digest && (
              <p style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginBottom: "1rem",
              }}>
                Digest: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#000",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>

            <p style={{
              marginTop: "1rem",
              fontSize: "0.75rem",
              color: "#9ca3af",
              textAlign: "center",
            }}>
              If this error persists, please contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
