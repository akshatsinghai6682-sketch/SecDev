import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { runTestSuite } from "@/lib/test-functions/test-suite";
import { runSecurityScan } from "@/lib/test-functions/security-scan";
import { runApiTests } from "@/lib/test-functions/api-tests";
import { runPerformanceTests } from "@/lib/test-functions/performance-tests";
import { runVibetest } from "@/lib/test-functions/vibetest-run";
import { runSecurityAgent } from "@/lib/security-agent/functions";
import { indexDeploymentLogs, cronReindexLogs } from "@/lib/vector-indexer"; // ← add this

const handleCiWorkflow = inngest.createFunction(
  { id: "handle-ci-workflow" },
  { event: "ci/workflow.triggered" },
  async ({ event, step }) => {
    const { ref, sha } = event.data;

    await step.run("execute-safely", async () => {
      console.log(`Processing build for Ref: ${ref}, SHA: ${sha}`);
      return { status: "processed" };
    });
  }
);

// Allow Inngest handler up to 5 minutes (max for Vercel hobby plan)
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runTestSuite, runSecurityScan, runApiTests, runPerformanceTests, runVibetest, runSecurityAgent, indexDeploymentLogs, cronReindexLogs, handleCiWorkflow],
});