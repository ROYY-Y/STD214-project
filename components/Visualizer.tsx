"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Simulator.module.css";

interface Ball {
  id: string;
  originalIndex: number;
  color: "red" | "blue";
  value: number;
}

interface VisualizerProps {
  populationBalls: Ball[];
  sampledBalls: Ball[];
  activeBallId: string | null;
  samplingMethod: "with" | "without";
  sampledIndices: Set<number>;
  targetn: number;
  isSampling: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  populationBalls,
  sampledBalls,
  activeBallId,
  samplingMethod,
  sampledIndices,
  targetn,
  isSampling,
}) => {
  const currentProgress = targetn > 0 ? (sampledBalls.length / targetn) * 100 : 0;

  return (
    <div className={styles.mainArea}>
      {/* Simulation Progress bar and Status */}
      <div
        style={{
          background: "rgba(30, 41, 59, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div className={styles.statusMessage}>
          <span style={{ fontWeight: 600 }}>
            {isSampling
              ? `Drawing sample: ${sampledBalls.length} / ${targetn} complete`
              : sampledBalls.length > 0
              ? `Sampling complete! Drawn ${sampledBalls.length} balls.`
              : "Ready to sample"}
          </span>
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            {samplingMethod === "with" ? "With Replacement" : "Without Replacement"}
          </span>
        </div>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      <div className={styles.columnsContainer}>
        {/* Population Container */}
        <div className={`${styles.colCard} ${styles.populationCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitleText}>
              Population Box
            </h3>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Total (N): {populationBalls.length}
            </span>
          </div>

          <div className={styles.box}>
            {populationBalls.length === 0 ? (
              <div className={styles.boxPlaceholder}>
                Adjust configuration to generate population balls.
              </div>
            ) : (
              populationBalls.map((ball) => {
                const isSampled = samplingMethod === "without" && sampledIndices.has(ball.originalIndex);
                const isActive = activeBallId === ball.id;

                return (
                  <motion.div
                    key={ball.id}
                    layoutId={samplingMethod === "without" ? undefined : `pop-${ball.id}`}
                    animate={{
                      scale: isActive ? 1.4 : 1,
                      opacity: isSampled ? 0.15 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: isActive ? 400 : 200,
                      damping: isActive ? 15 : 25,
                    }}
                    className={`${styles.ball} ${
                      ball.color === "red" ? styles.redBall : styles.blueBall
                    } ${isActive ? styles.ballActive : ""} ${
                      isSampled ? styles.ballDimmed : ""
                    }`}
                    title={`Index: ${ball.originalIndex + 1}, Value: ${ball.value}`}
                  >
                    {ball.value}
                  </motion.div>
                );
              })
            )}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", gap: "1rem" }}>
            <span>🔴 Red Value = {populationBalls.find((b) => b.color === "red")?.value ?? "N/A"}</span>
            <span>🔵 Blue Value = {populationBalls.find((b) => b.color === "blue")?.value ?? "N/A"}</span>
          </div>
        </div>

        {/* Sample Container */}
        <div className={`${styles.colCard} ${styles.sampleCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitleText}>
              Sample Box
            </h3>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Sampled (n): {sampledBalls.length} / {targetn}
            </span>
          </div>

          <div className={styles.box} style={{ minHeight: "260px" }}>
            {sampledBalls.length === 0 && !isSampling && (
              <div className={styles.boxPlaceholder}>
                Sample container is empty.
                <br />
                Click "Start Sampling" to draw.
              </div>
            )}
            <AnimatePresence>
              {sampledBalls.map((ball, idx) => (
                <motion.div
                  key={`sample-${ball.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0, y: -40, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 40 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className={`${styles.ball} ${
                    ball.color === "red" ? styles.redBall : styles.blueBall
                  }`}
                  title={`Draw Order: ${idx + 1}, Original ID: ${ball.id}, Value: ${ball.value}`}
                >
                  {ball.value}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Shows the exact sequence of balls drawn in chronological order.
          </div>
        </div>
      </div>
    </div>
  );
};
