import "dotenv/config"; // if using ts-node
import { prisma } from "@/lib/prisma";
import Pusher from "pusher";
import cron from "node-cron";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

cron.schedule("*/10 * * * *", async () => {
  const expired = await prisma.claim.findMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
    select: { id: true, taskId: true },
  });

  if (expired.length === 0) return;

  const ids = expired.map((c) => c.id);
  await prisma.claim.updateMany({
    where: { id: { in: ids } },
    data: { status: "EXPIRED" },
  });

  // Fire realtime updates
  const uniques = [...new Set(expired.map((c) => c.taskId))];
  await Promise.all(
    uniques.map((taskId) => pusher.trigger(`task-${taskId}`, "updated", {})),
  );
});

// Start immediately if not under cron supervisor
(async () => {
  console.log("Claim‑expiry worker up – sweeping every 10 minutes");
})();
