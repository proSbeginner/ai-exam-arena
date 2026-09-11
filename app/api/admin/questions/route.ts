import { validateAdminQuestion } from "@/features/admin/admin.logic";
import type { AdminQuestionInput } from "@/features/admin/admin.types";
import { DataSourceConfigError } from "@/server/providers/data-source";
import { getAdminQuestionProvider } from "@/server/providers/admin-question.provider";

function authorize(request: Request): Response | null {
  const expected = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const received = request.headers.get("x-admin-email")?.trim().toLowerCase();
  if (!expected || !received || expected !== received)
    return Response.json(
      { error: { message: "อีเมล Admin ไม่ถูกต้อง" } },
      { status: 403 },
    );
  return null;
}

export async function GET(request: Request) {
  const denied = authorize(request);
  if (denied) return denied;
  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = limitParam === null ? undefined : Number(limitParam);
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
    return Response.json(
      { error: { message: "limit ต้องเป็นจำนวนเต็มที่มากกว่า 0" } },
      { status: 400 },
    );
  }
  try {
    const questions = await getAdminQuestionProvider().listQuestions(limit);
    return Response.json({ questions });
  } catch (error) {
    if (error instanceof DataSourceConfigError)
      return Response.json(
        { error: { message: error.message } },
        { status: 503 },
      );
    return Response.json(
      { error: { message: "ไม่สามารถโหลดคำถามได้" } },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const denied = authorize(request);
  if (denied) return denied;
  const input = (await request.json()) as AdminQuestionInput;
  const validationError = validateAdminQuestion(input);
  if (validationError)
    return Response.json(
      { error: { message: validationError } },
      { status: 400 },
    );
  try {
    return Response.json(
      { question: await getAdminQuestionProvider().createQuestion(input) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DataSourceConfigError)
      return Response.json(
        { error: { message: error.message } },
        { status: 503 },
      );
    return Response.json(
      { error: { message: "ไม่สามารถบันทึกคำถามได้" } },
      { status: 500 },
    );
  }
}
