import * as notificationRepository from "../repositories/notification.repository";

export async function listForUser(userId: string) {
  return notificationRepository.findForUser(userId);
}
