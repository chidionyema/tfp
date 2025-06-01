import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* GET /api/tasks/[taskId]/summary */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params;

  type PendingRow = {
    count: number;
    minFee: number | null;
    helperRating: number | null;
  };

  const result = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int                AS count,
            MIN(fee)::int               AS "minFee",
            (SELECT rating FROM "User" u WHERE u.id = (
              SELECT helper_id
              FROM "Claim"
              WHERE task_id = $1 AND status = 'PENDING'
              ORDER BY fee ASC LIMIT 1
            )) AS "helperRating"
     FROM "Claim"
     WHERE task_id = $1 AND status = 'PENDING'`,
    taskId,
  ) as PendingRow[];

  const row = result[0] ?? { count: 0, minFee: null, helperRating: null };

  return NextResponse.json({
    countPending: row.count,
    bestOffer:
      row.minFee === null
        ? null
        : { fee: row.minFee, helperRating: row.helperRating },
  });
}
