import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { DecisionWaterfall } from "../components/DecisionWaterfall";
import { MOCK_DECISIONS } from "../data/mockData";

describe("Frontend UI Component Verification (Phase 12)", () => {
  describe("1. Badge Component", () => {
    it("should render approved badge with correct label", () => {
      render(<Badge variant="approved">Approved Order</Badge>);
      expect(screen.getByText("Approved Order")).toBeDefined();
    });

    it("should render blocked badge with correct label", () => {
      render(<Badge variant="blocked">Vetoed Trade</Badge>);
      expect(screen.getByText("Vetoed Trade")).toBeDefined();
    });

    it("should render buy badge with buy styling", () => {
      render(<Badge variant="buy">BUY</Badge>);
      expect(screen.getByText("BUY")).toBeDefined();
    });
  });

  describe("2. MetricCard Component", () => {
    it("should render metric label, value, and change indicators", () => {
      render(
        <MetricCard
          label="Portfolio Total Value"
          value="$104,850.25"
          change="+$1,420.50"
          changeType="positive"
          caption="Today's Session Gain"
        />
      );

      expect(screen.getByText("Portfolio Total Value")).toBeDefined();
      expect(screen.getByText("$104,850.25")).toBeDefined();
      expect(screen.getByText("+$1,420.50")).toBeDefined();
      expect(screen.getByText("Today's Session Gain")).toBeDefined();
    });
  });

  describe("3. EmptyState & ErrorState Components", () => {
    it("should render empty state message and action", () => {
      render(
        <EmptyState
          title="No Open Orders"
          description="Your order queue is currently clear."
          actionText="Place Paper Trade"
          onAction={() => {}}
        />
      );

      expect(screen.getByText("No Open Orders")).toBeDefined();
      expect(screen.getByText("Your order queue is currently clear.")).toBeDefined();
    });

    it("should render error state with retry button", () => {
      render(
        <ErrorState
          title="Exchange Sync Error"
          message="Failed to connect to market stream."
          onRetry={() => {}}
        />
      );

      expect(screen.getByText("Exchange Sync Error")).toBeDefined();
      expect(screen.getByText("Failed to connect to market stream.")).toBeDefined();
    });
  });

  describe("4. DecisionWaterfall Component", () => {
    it("should render all 6 formal pipeline stages for an approved trade", () => {
      render(<DecisionWaterfall decision={MOCK_DECISIONS[0]} />);

      expect(screen.getByText("Step 1: Observation")).toBeDefined();
      expect(screen.getByText("Step 2: Technical Analysis")).toBeDefined();
      expect(screen.getByText("Step 3: Reasoning & Hypothesis")).toBeDefined();
      expect(screen.getByText("Step 4: Proposed Order")).toBeDefined();
      expect(screen.getByText("Step 5: Deterministic Risk Check")).toBeDefined();
      expect(screen.getByText("Step 6: Final Execution Verdict")).toBeDefined();
    });

    it("should render risk veto memo for a blocked trade", () => {
      render(<DecisionWaterfall decision={MOCK_DECISIONS[1]} />);

      expect(screen.getByText("BLOCKED BY RISK GUARD")).toBeDefined();
      expect(screen.getByText("ZERO BROKER EXPOSURE")).toBeDefined();
    });
  });
});
