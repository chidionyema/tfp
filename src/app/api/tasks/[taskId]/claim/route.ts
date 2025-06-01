import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

/* ───────────────────────── Request body ───────────────────────── */
const ClaimSchema = z.object({
  helperId:      z.string().uuid(),
  fee:           z.number().positive(),
  notes:         z.string().max(10_000).optional(),
  clientVersion: z.number().int().nonnegative(),
});
type ClaimRequestBody = z.infer<typeof ClaimSchema>;

/* ───────────────────────── Domain errors ───────────────────────── */
const ERR = {
  TASK_NOT_FOUND:     "TASK_NOT_FOUND",
  TASK_CLOSED:        "TASK_CLOSED",
  VERSION_MISMATCH:   "VERSION_MISMATCH",
  MAX_CLAIMS_REACHED: "MAX_CLAIMS_REACHED",
} as const;
type DomainError = keyof typeof ERR;

const CONFLICT_ERRORS: ReadonlySet<DomainError> = new Set([
  "TASK_CLOSED",
  "VERSION_MISMATCH",
  "MAX_CLAIMS_REACHED",
]);

/* ───────────────────────── Route handler ───────────────────────── */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },   // ← Promise!
) {
  /* 1. await params */
  const { taskId } = await params;                       // ← await here

  /* 2. parse body */
  let body: ClaimRequestBody;
  try {
    body = ClaimSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }
  const { helperId, fee, notes, clientVersion } = body;

  try {
    /* 3. serialised transaction */
    const claimId = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        select: {
          version: true,
          maxClaims: true,
          status: true,
          claims: { where: { status: "PENDING" }, select: { id: true } },
        },
      });

      if (!task)                     throw new Error(ERR.TASK_NOT_FOUND);
      if (task.status !== "OPEN")    throw new Error(ERR.TASK_CLOSED);
      if (task.version !== clientVersion)
                                     throw new Error(ERR.VERSION_MISMATCH);
      if (task.claims.length >= task.maxClaims)
                                     throw new Error(ERR.MAX_CLAIMS_REACHED);

      const { id } = await tx.claim.create({
        data: {
          taskId,
          helperId,
          fee,
          notes,
          expiresAt: new Date(Date.now() + 86_400_000), // 24 h
        },
      });

      await tx.task.update({
        where: { id: taskId, version: clientVersion },
        data:  { version: { increment: 1 } },
      });

      await tx.$executeRaw`SELECT pg_notify('task_claimed', ${taskId})`;

      return id;
    });

    /* 4. revalidate & respond */
    revalidatePath(`/tasks/${taskId}`);
    return NextResponse.json({ claimId }, { status: 201 });

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "UNKNOWN_ERROR";

    const status =
      message === ERR.TASK_NOT_FOUND
        ? 404
        : CONFLICT_ERRORS.has(message as DomainError)
        ? 409
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
