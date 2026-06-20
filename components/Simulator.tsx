"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./Simulator.module.css";
import { Sidebar } from "./Sidebar";
import { Visualizer } from "./Visualizer";
import { Results } from "./Results";

interface Ball {
  id: string;
  originalIndex: number;
  color: "red" | "blue";
  value: number;
}

export default function Simulator() {
  // Configuration States
  const [N, setN] = useState<number>(60);
  const [n, setn] = useState<number>(10);
  const [redCount, setRedCount] = useState<number>(36);
  const [redValue, setRedValue] = useState<number>(1);
  const [blueValue, setBlueValue] = useState<number>(0);
  const [samplingMethod, setSamplingMethod] = useState<"with" | "without">("without");
  const [speed, setSpeed] = useState<"slow" | "medium" | "fast" | "instant">("medium");

  // Simulation Running States
  const [populationBalls, setPopulationBalls] = useState<Ball[]>([]);
  const [sampledBalls, setSampledBalls] = useState<Ball[]>([]);
  const [sampledIndices, setSampledIndices] = useState<Set<number>>(new Set());
  const [activeBallId, setActiveBallId] = useState<string | null>(null);
  const [isSampling, setIsSampling] = useState<boolean>(false);
  const [hasSampled, setHasSampled] = useState<boolean>(false);

  // Timeouts Ref for cleanup
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Function to clear all scheduled timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  // Generate population on configuration change
  useEffect(() => {
    clearAllTimeouts();
    
    // Create base population in a sorted fashion
    const baseBalls: Ball[] = [];
    const blueCount = N - redCount;

    for (let i = 0; i < N; i++) {
      const isRed = i < redCount;
      baseBalls.push({
        id: `ball_${i}`,
        originalIndex: i,
        color: isRed ? "red" : "blue",
        value: isRed ? redValue : blueValue,
      });
    }

    // Shuffle them so they display organically in the Population Box
    const shuffled = [...baseBalls];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    setPopulationBalls(shuffled);
    setSampledBalls([]);
    setSampledIndices(new Set());
    setActiveBallId(null);
    setIsSampling(false);
    setHasSampled(false);

    return () => clearAllTimeouts();
  }, [N, redCount, redValue, blueValue]);

  // Sync samplingMethod with sample size limits
  useEffect(() => {
    if (samplingMethod === "without" && n > N) {
      setn(N);
    }
  }, [samplingMethod, N, n]);

  // Handle resets
  const handleReset = () => {
    clearAllTimeouts();
    setSampledBalls([]);
    setSampledIndices(new Set());
    setActiveBallId(null);
    setIsSampling(false);
    setHasSampled(false);
  };

  // Run sampling routine
  const handleStartSampling = () => {
    clearAllTimeouts();
    setSampledBalls([]);
    setSampledIndices(new Set());
    setActiveBallId(null);
    setIsSampling(true);
    setHasSampled(true);

    if (speed === "instant") {
      runInstantSampling();
    } else {
      runAnimatedSampling(0, [], new Set());
    }
  };

  // Instant sampling logic
  const runInstantSampling = () => {
    const nextSample: Ball[] = [];
    const nextIndices = new Set<number>();

    for (let step = 0; step < n; step++) {
      let chosenIndex = -1;
      if (samplingMethod === "with") {
        chosenIndex = Math.floor(Math.random() * N);
      } else {
        const available: number[] = [];
        for (let i = 0; i < N; i++) {
          if (!nextIndices.has(i)) {
            available.push(i);
          }
        }
        if (available.length === 0) break;
        const rand = Math.floor(Math.random() * available.length);
        chosenIndex = available[rand];
      }

      // Find the ball in the population list by originalIndex
      const chosenBall = populationBalls.find((b) => b.originalIndex === chosenIndex);
      if (chosenBall) {
        nextSample.push(chosenBall);
        if (samplingMethod === "without") {
          nextIndices.add(chosenIndex);
        }
      }
    }

    setSampledBalls(nextSample);
    setSampledIndices(nextIndices);
    setIsSampling(false);
  };

  // Animated sampling recursive logic
  const runAnimatedSampling = (
    currentDrawCount: number,
    currentSample: Ball[],
    currentIndices: Set<number>
  ) => {
    if (currentDrawCount >= n) {
      setIsSampling(false);
      setActiveBallId(null);
      return;
    }

    let chosenIndex = -1;
    if (samplingMethod === "with") {
      chosenIndex = Math.floor(Math.random() * N);
    } else {
      const available: number[] = [];
      for (let i = 0; i < N; i++) {
        if (!currentIndices.has(i)) {
          available.push(i);
        }
      }
      if (available.length === 0) {
        setIsSampling(false);
        setActiveBallId(null);
        return;
      }
      const rand = Math.floor(Math.random() * available.length);
      chosenIndex = available[rand];
    }

    const chosenBall = populationBalls.find((b) => b.originalIndex === chosenIndex);
    if (!chosenBall) {
      setIsSampling(false);
      return;
    }

    // Phase 1: Highlight the chosen ball in the population
    setActiveBallId(chosenBall.id);

    const speeds = { slow: 1000, medium: 500, fast: 200, instant: 0 };
    const delay = speeds[speed];

    // Phase 2: Add it to sample after delay/2
    const addTimeout = setTimeout(() => {
      const nextSample = [...currentSample, chosenBall];
      const nextIndices = new Set(currentIndices);
      if (samplingMethod === "without") {
        nextIndices.add(chosenIndex);
      }

      setSampledBalls(nextSample);
      setSampledIndices(nextIndices);

      // Phase 3: Transition to next draw after another delay/2
      const nextTimeout = setTimeout(() => {
        runAnimatedSampling(currentDrawCount + 1, nextSample, nextIndices);
      }, delay / 2);

      timeoutsRef.current.push(nextTimeout);
    }, delay / 2);

    timeoutsRef.current.push(addTimeout);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>STD 214 Statistics Sampling Simulator</h1>
        <p className={styles.subtitle}>
          Visualizing the difference between Population Parameters & Sample Statistics
        </p>
      </header>

      <div className={styles.layout}>
        {/* Sidebar Controls */}
        <Sidebar
          N={N}
          setN={setN}
          n={n}
          setn={setn}
          redCount={redCount}
          setRedCount={setRedCount}
          redValue={redValue}
          setRedValue={setRedValue}
          blueValue={blueValue}
          setBlueValue={setBlueValue}
          samplingMethod={samplingMethod}
          setSamplingMethod={setSamplingMethod}
          speed={speed}
          setSpeed={setSpeed}
          isSampling={isSampling}
          onStart={handleStartSampling}
          onReset={handleReset}
          hasSampled={hasSampled}
        />

        {/* Main Simulator Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Visual Container */}
          <Visualizer
            populationBalls={populationBalls}
            sampledBalls={sampledBalls}
            activeBallId={activeBallId}
            samplingMethod={samplingMethod}
            sampledIndices={sampledIndices}
            targetn={n}
            isSampling={isSampling}
          />

          {/* Calculations Results */}
          <Results
            N={N}
            redCount={redCount}
            redValue={redValue}
            blueValue={blueValue}
            sampledBalls={sampledBalls}
          />


        </div>
      </div>
    </div>
  );
}
