"use client";

import React from "react";
import styles from "./Simulator.module.css";

interface SidebarProps {
  N: number;
  setN: (val: number) => void;
  n: number;
  setn: (val: number) => void;
  redCount: number;
  setRedCount: (val: number) => void;
  redValue: number;
  setRedValue: (val: number) => void;
  blueValue: number;
  setBlueValue: (val: number) => void;
  samplingMethod: "with" | "without";
  setSamplingMethod: (method: "with" | "without") => void;
  speed: "slow" | "medium" | "fast" | "instant";
  setSpeed: (speed: "slow" | "medium" | "fast" | "instant") => void;
  isSampling: boolean;
  onStart: () => void;
  onReset: () => void;
  hasSampled: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  N,
  setN,
  n,
  setn,
  redCount,
  setRedCount,
  redValue,
  setRedValue,
  blueValue,
  setBlueValue,
  samplingMethod,
  setSamplingMethod,
  speed,
  setSpeed,
  isSampling,
  onStart,
  onReset,
  hasSampled,
}) => {
  const blueCount = N - redCount;

  // Handle Population Size changes
  const handleNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(10, Math.min(200, parseInt(e.target.value) || 10));
    setN(value);
    
    // Adjust Red count if it exceeds new N
    if (redCount > value) {
      setRedCount(value);
    } else {
      // Keep ratio roughly same or just keep redCount. Let's make sure blue count is valid
      const newBlue = value - redCount;
      if (newBlue < 0) {
        setRedCount(value);
      }
    }

    // Adjust Sample size if without replacement and n exceeds new N
    if (samplingMethod === "without" && n > value) {
      setn(value);
    }
  };

  // Handle Red Count changes
  const handleRedCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(N, parseInt(e.target.value) || 0));
    setRedCount(value);
  };

  // Handle Blue Count changes
  const handleBlueCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(N, parseInt(e.target.value) || 0));
    setRedCount(N - value);
  };

  // Handle Sample Size changes
  const handleSampleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limit = samplingMethod === "without" ? N : 200;
    const value = Math.max(1, Math.min(limit, parseInt(e.target.value) || 1));
    setn(value);
  };

  // Handle sampling method toggle
  const handleMethodChange = (method: "with" | "without") => {
    setSamplingMethod(method);
    if (method === "without" && n > N) {
      setn(N);
    }
  };

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sectionTitle}>Simulator Controls</h2>

      {/* Population Config */}
      <div className={styles.formGroup}>
        <div className={styles.label}>
          <span>Population Size (N)</span>
          <span className={styles.labelInfo}>{N} balls</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          value={N}
          onChange={handleNChange}
          disabled={isSampling}
          className={styles.input}
        />
        <input
          type="number"
          min="10"
          max="200"
          value={N}
          onChange={handleNChange}
          disabled={isSampling}
          className={styles.input}
          style={{ marginTop: "-4px" }}
        />
      </div>

      {/* Red & Blue Configuration */}
      <div className={styles.formGroup}>
        <div className={styles.label}>
          <span>Red Balls Count</span>
          <span className={styles.labelInfo} style={{ color: "#f87171" }}>{redCount} balls</span>
        </div>
        <input
          type="range"
          min="0"
          max={N}
          value={redCount}
          onChange={handleRedCountChange}
          disabled={isSampling}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.label}>
          <span>Blue Balls Count</span>
          <span className={styles.labelInfo} style={{ color: "#60a5fa" }}>{blueCount} balls</span>
        </div>
        <input
          type="range"
          min="0"
          max={N}
          value={blueCount}
          onChange={handleBlueCountChange}
          disabled={isSampling}
          className={styles.input}
        />
      </div>

      {/* Ball Values Configuration */}
      <div className={styles.formGroup}>
        <div className={styles.label}>
          <span>Ball Values (Scores)</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 600 }}>Red Value</label>
            <input
              type="number"
              value={redValue}
              onChange={(e) => setRedValue(parseFloat(e.target.value) || 0)}
              disabled={isSampling}
              className={styles.input}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#60a5fa", fontWeight: 600 }}>Blue Value</label>
            <input
              type="number"
              value={blueValue}
              onChange={(e) => setBlueValue(parseFloat(e.target.value) || 0)}
              disabled={isSampling}
              className={styles.input}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Sampling Method Toggle */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Sampling Method</label>
        <div className={styles.radioGroup}>
          <input
            type="radio"
            id="methodWith"
            name="samplingMethod"
            checked={samplingMethod === "with"}
            onChange={() => handleMethodChange("with")}
            disabled={isSampling}
            className={styles.radioInput}
          />
          <label htmlFor="methodWith" className={styles.radioLabel}>
            With Replacement
          </label>

          <input
            type="radio"
            id="methodWithout"
            name="samplingMethod"
            checked={samplingMethod === "without"}
            onChange={() => handleMethodChange("without")}
            disabled={isSampling}
            className={styles.radioInput}
          />
          <label htmlFor="methodWithout" className={styles.radioLabel}>
            Without Replacement
          </label>
        </div>
      </div>

      {/* Sample Size (n) */}
      <div className={styles.formGroup}>
        <div className={styles.label}>
          <span>Sample Size (n)</span>
          <span className={styles.labelInfo}>{n} balls</span>
        </div>
        <input
          type="range"
          min="1"
          max={samplingMethod === "without" ? N : 200}
          value={n}
          onChange={handleSampleSizeChange}
          disabled={isSampling}
          className={styles.input}
        />
        <input
          type="number"
          min="1"
          max={samplingMethod === "without" ? N : 200}
          value={n}
          onChange={handleSampleSizeChange}
          disabled={isSampling}
          className={styles.input}
          style={{ marginTop: "-4px" }}
        />
        {samplingMethod === "without" && n > N && (
          <span className={styles.errorText}>
            Sample size cannot exceed population size without replacement.
          </span>
        )}
      </div>

      {/* Speed Controls */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Animation Speed</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.25rem" }}>
          {(["slow", "medium", "fast", "instant"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              disabled={isSampling}
              style={{
                padding: "0.5rem 0.25rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "capitalize",
                border: "none",
                cursor: "pointer",
                background: speed === s ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.05)",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: speed === s ? "#6366f1" : "transparent",
                color: speed === s ? "#fff" : "#94a3b8",
                transition: "all 0.2s ease",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={onStart}
          disabled={isSampling || (samplingMethod === "without" && n > N)}
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          {isSampling ? "Sampling..." : "Start Sampling"}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isSampling || !hasSampled}
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          Reset Simulator
        </button>
      </div>
    </div>
  );
};
