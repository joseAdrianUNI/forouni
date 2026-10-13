import { ApiError } from "../utils/ApiError";
import type { JwtPayload } from "../types/models";
import * as moderationRepository from "../repositories/moderation.repository";
import * as postService from "./post.service";
import * as threadService from "./thread.service";

type TargetType = "thread" | "post";

export async function listReports(status?: string) {
  if (status && !["pending", "resolved", "rejected"].includes(status)) {
    throw ApiError.badRequest("Estado de reporte inválido");
  }
  return moderationRepository.findAll(
    status as "pending" | "resolved" | "rejected" | undefined,
  );
}

export async function createReport(input: {
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
}) {
  if (input.targetType !== "thread" && input.targetType !== "post") {
    throw ApiError.badRequest("targetType debe ser thread o post");
  }
  if (!input.targetId || !input.reason?.trim()) {
    throw ApiError.badRequest("targetId y reason son obligatorios");
  }
  const targetType = input.targetType as TargetType;
  if (!(await moderationRepository.targetExists(targetType, input.targetId))) {
    throw ApiError.notFound("Contenido reportado no encontrado");
  }
  return moderationRepository.create({ ...input, targetType });
}

export async function resolveReport(
  id: string,
  user: JwtPayload,
  status: string,
) {
  if (status !== "resolved" && status !== "rejected") {
    throw ApiError.badRequest("El estado debe ser resolved o rejected");
  }

  const report = await moderationRepository.findById(id);
  if (!report) throw ApiError.notFound("Reporte no encontrado");
  if (report.status !== "pending") {
    throw ApiError.badRequest("El reporte ya fue atendido");
  }

  if (status === "resolved") {
    if (report.target_type === "post") {
      await postService.remove(report.target_id, user);
    } else {
      await threadService.remove(report.target_id, user);
    }
  }

  const updatedReport = await moderationRepository.resolve(
    id,
    user.sub,
    status as "resolved" | "rejected",
  );
  if (!updatedReport) throw ApiError.notFound("Reporte no encontrado");
  return updatedReport;
}
