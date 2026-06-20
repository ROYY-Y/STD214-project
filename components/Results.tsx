"use client";

import React from "react";
import styles from "./Simulator.module.css";
import { Latex } from "./Latex";

interface Ball {
  id: string;
  originalIndex: number;
  color: "red" | "blue";
  value: number;
}

interface ResultsProps {
  N: number;
  redCount: number;
  redValue: number;
  blueValue: number;
  sampledBalls: Ball[];
}

export const Results: React.FC<ResultsProps> = ({
  N,
  redCount,
  redValue,
  blueValue,
  sampledBalls,
}) => {
  const blueCount = N - redCount;

  // -- POPULATION STATISTICS --
  // Population Mean (mu)
  const popSum = redCount * redValue + blueCount * blueValue;
  const mu = popSum / N;

  // Population Proportion (p) of Red Balls
  const p = redCount / N;

  // Population Variance (sigma^2)
  const popVar =
    (redCount * Math.pow(redValue - mu, 2) + blueCount * Math.pow(blueValue - mu, 2)) / N;

  // -- SAMPLE STATISTICS --
  const currentn = sampledBalls.length;
  const sampledRedCount = sampledBalls.filter((b) => b.color === "red").length;
  const sampledBlueCount = currentn - sampledRedCount;

  // Sample Mean (x-bar)
  const sampleSum = sampledRedCount * redValue + sampledBlueCount * blueValue;
  const xBar = currentn > 0 ? sampleSum / currentn : 0;

  // Sample Proportion (p-hat)
  const pHat = currentn > 0 ? sampledRedCount / currentn : 0;

  // Sample Variance (S^2)
  let sampleVar = 0;
  let isVarDefined = false;

  if (currentn > 1) {
    sampleVar =
      (sampledRedCount * Math.pow(redValue - xBar, 2) +
        sampledBlueCount * Math.pow(blueValue - xBar, 2)) /
      (currentn - 1);
    isVarDefined = true;
  }

  // Format Helper
  const fmt = (val: number) => Number(val.toFixed(4));

  // Compute deviations for comparison
  const meanDiff = currentn > 0 ? Math.abs(mu - xBar) : null;
  const propDiff = currentn > 0 ? Math.abs(p - pHat) : null;
  const varDiff = currentn > 1 ? Math.abs(popVar - sampleVar) : null;

  const getDiffBadgeClass = (diff: number | null) => {
    if (diff === null) return "";
    if (diff < 0.05) return `${styles.comparisonDiff} ${styles.diffGood}`;
    if (diff < 0.15) return `${styles.comparisonDiff} ${styles.diffWarn}`;
    return `${styles.comparisonDiff} ${styles.diffAlert}`;
  };

  const getDiffText = (diff: number | null) => {
    if (diff === null) return "N/A";
    if (diff < 0.05) return "Close Match";
    if (diff < 0.15) return "Moderate Dev.";
    return "High Dev.";
  };

  return (
    <div className={styles.mainArea}>
      <div className={styles.columnsContainer}>
        {/* Population Parameters */}
        <div className={`${styles.colCard} ${styles.populationCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitleText}>Population Parameters</h3>
            <span className={`${styles.badge} ${styles.badgePop}`}>N = {N}</span>
          </div>

          <div className={styles.statsList}>
            {/* Population Mean */}
            <div className={styles.statRow}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Population Mean (μ)</span>
                <span className={`${styles.statValue} ${styles.valPop}`}>{fmt(mu)}</span>
              </div>
              <div className={styles.formulaContainer}>
                <Latex
                  math={`\\mu = \\frac{\\sum_{i=1}^N X_i}{N} = \\frac{(${redCount} \\times ${redValue}) + (${blueCount} \\times ${blueValue})}{${N}} = ${fmt(mu)}`}
                  block
                />
              </div>
            </div>

            {/* Population Proportion */}
            <div className={styles.statRow}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Population Proportion (p, Red)</span>
                <span className={`${styles.statValue} ${styles.valPop}`}>{fmt(p)}</span>
              </div>
              <div className={styles.formulaContainer}>
                <Latex
                  math={`p = \\frac{\\text{Red Balls}}{N} = \\frac{${redCount}}{${N}} = ${fmt(p)}`}
                  block
                />
              </div>
            </div>

            {/* Population Variance */}
            <div className={styles.statRow}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Population Variance (σ²)</span>
                <span className={`${styles.statValue} ${styles.valPop}`}>{fmt(popVar)}</span>
              </div>
              <div className={styles.formulaContainer}>
                <Latex
                  math={`\\sigma^2 = \\frac{\\sum (X_i - \\mu)^2}{N} = \\frac{${redCount}(${redValue} - ${fmt(mu)})^2 + ${blueCount}(${blueValue} - ${fmt(mu)})^2}{${N}} = ${fmt(popVar)}`}
                  block
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sample Statistics */}
        <div className={`${styles.colCard} ${styles.sampleCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitleText}>Sample Statistics</h3>
            <span className={`${styles.badge} ${styles.badgeSample}`}>n = {currentn}</span>
          </div>

          {currentn === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                minHeight: "350px",
                color: "#94a3b8",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📊</div>
              <p style={{ fontSize: "1rem", fontWeight: 500 }}>No sample data yet</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Click "Start Sampling" to draw balls and compute sample statistics in real-time.
              </p>
            </div>
          ) : (
            <div className={styles.statsList}>
              {/* Sample Mean */}
              <div className={styles.statRow}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Sample Mean (x̄)</span>
                  <span className={`${styles.statValue} ${styles.valSample}`}>{fmt(xBar)}</span>
                </div>
                <div className={styles.formulaContainer}>
                  <Latex
                    math={`\\bar{x} = \\frac{\\sum_{i=1}^n x_i}{n} = \\frac{(${sampledRedCount} \\times ${redValue}) + (${sampledBlueCount} \\times ${blueValue})}{${currentn}} = ${fmt(xBar)}`}
                    block
                  />
                </div>
              </div>

              {/* Sample Proportion */}
              <div className={styles.statRow}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Sample Proportion (p̂)</span>
                  <span className={`${styles.statValue} ${styles.valSample}`}>{fmt(pHat)}</span>
                </div>
                <div className={styles.formulaContainer}>
                  <Latex
                    math={`\\hat{p} = \\frac{\\text{Sample Red}}{n} = \\frac{${sampledRedCount}}{${currentn}} = ${fmt(pHat)}`}
                    block
                  />
                </div>
              </div>

              {/* Sample Variance */}
              <div className={styles.statRow}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Sample Variance (S²)</span>
                  <span className={`${styles.statValue} ${styles.valSample}`}>
                    {isVarDefined ? fmt(sampleVar) : "Undefined"}
                  </span>
                </div>
                <div className={styles.formulaContainer}>
                  {isVarDefined ? (
                    <Latex
                      math={`S^2 = \\frac{\\sum (x_i - \\bar{x})^2}{n - 1} = \\frac{${sampledRedCount}(${redValue} - ${fmt(xBar)})^2 + ${sampledBlueCount}(${blueValue} - ${fmt(xBar)})^2}{${currentn} - 1} = ${fmt(sampleVar)}`}
                      block
                    />
                  ) : (
                    <div style={{ fontSize: "0.8rem", color: "#f87171", textAlign: "center", padding: "0.25rem 0" }}>
                      Variance requires $n \ge 2$ to calculate an unbiased estimator ($n-1$ in denominator).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Summary Card */}
      <div className={styles.comparisonCard}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "#f8fafc" }}>
          Parameter vs. Statistic Comparison
        </h4>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonItem}>
            <span className={styles.comparisonLabel}>Mean Error |μ - x̄|</span>
            <span className={styles.comparisonValue}>
              {fmt(mu)} vs {currentn > 0 ? fmt(xBar) : "—"}
            </span>
            <span
              className={getDiffBadgeClass(meanDiff) || styles.comparisonDiff}
              style={meanDiff === null ? { background: "rgba(255, 255, 255, 0.05)", color: "#64748b" } : undefined}
            >
              {meanDiff !== null ? `${fmt(meanDiff)} (${getDiffText(meanDiff)})` : "—"}
            </span>
          </div>

          <div className={styles.comparisonItem}>
            <span className={styles.comparisonLabel}>Proportion Error |p - p̂|</span>
            <span className={styles.comparisonValue}>
              {fmt(p)} vs {currentn > 0 ? fmt(pHat) : "—"}
            </span>
            <span
              className={getDiffBadgeClass(propDiff) || styles.comparisonDiff}
              style={propDiff === null ? { background: "rgba(255, 255, 255, 0.05)", color: "#64748b" } : undefined}
            >
              {propDiff !== null ? `${fmt(propDiff)} (${getDiffText(propDiff)})` : "—"}
            </span>
          </div>

          <div className={styles.comparisonItem}>
            <span className={styles.comparisonLabel}>Variance Error |σ² - S²|</span>
            <span className={styles.comparisonValue}>
              {fmt(popVar)} vs {isVarDefined ? fmt(sampleVar) : "—"}
            </span>
            <span
              className={getDiffBadgeClass(varDiff) || styles.comparisonDiff}
              style={varDiff === null ? { background: "rgba(255, 255, 255, 0.05)", color: "#64748b" } : undefined}
            >
              {varDiff !== null ? `${fmt(varDiff)} (${getDiffText(varDiff)})` : "—"}
            </span>
          </div>
        </div>
        <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#94a3b8", textAlign: "center" }}>
          💡 <strong>Educational Note:</strong> As you increase the sample size <Latex math="n" />, you will notice the
          sample statistics <Latex math="\bar{x}" />, <Latex math="\hat{p}" />, and <Latex math="S^2" /> converge closer to the
          population parameters <Latex math="\mu" />, <Latex math="p" />, and <Latex math="\sigma^2" />. This is known as the{" "}
          <strong>Law of Large Numbers</strong>.
        </div>
      </div>
    </div>
  );
};
