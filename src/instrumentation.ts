export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const globalForCron = globalThis as unknown as {
    soundseerCronStarted?: boolean;
  };
  if (globalForCron.soundseerCronStarted) return;
  globalForCron.soundseerCronStarted = true;

  const cron = await import("node-cron");
  const { syncProcessingRequests } = await import("@/lib/sync");

  cron.schedule("*/5 * * * *", () => {
    syncProcessingRequests().catch((err) =>
      console.error("Lidarr sync job failed", err)
    );
  });
}
