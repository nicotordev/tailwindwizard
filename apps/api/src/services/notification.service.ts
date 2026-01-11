import * as OneSignal from "@onesignal/node-onesignal";
import env from "../config/env.config.js";
import { userService } from "./user.service.js";

type NotificationPayload = {
  heading: string;
  message: string;
  url?: string;
  data?: Record<string, string>;
};

type NotificationResult =
  | { sent: true }
  | { sent: false; reason: "missing-config" | "missing-target" };

const oneSignalConfig =
  env.oneSignalApiKey && env.oneSignalAppId
    ? OneSignal.createConfiguration({
        restApiKey: env.oneSignalApiKey,
      })
    : null;

const oneSignalClient = oneSignalConfig
  ? new OneSignal.DefaultApi(oneSignalConfig)
  : null;

async function sendToExternalUserId(
  externalUserId: string,
  payload: NotificationPayload
): Promise<NotificationResult> {
  if (!env.oneSignalAppId || !env.oneSignalApiKey || !oneSignalClient) {
    return { sent: false, reason: "missing-config" };
  }

  const notification = new OneSignal.Notification();
  notification.app_id = env.oneSignalAppId;
  notification.include_aliases = {
    external_id: [externalUserId],
  };
  notification.target_channel = "push";
  notification.headings = { en: payload.heading };
  notification.contents = { en: payload.message };
  notification.data = payload.data;
  notification.url = payload.url;

  await oneSignalClient.createNotification(notification);

  return { sent: true };
}

async function sendToUserId(
  userId: string,
  payload: NotificationPayload
): Promise<NotificationResult> {
  const target = await userService.getNotificationTarget(userId);
  if (!target) return { sent: false, reason: "missing-target" };

  return sendToExternalUserId(target.externalUserId, payload);
}

export const notificationService = {
  sendToUserId,
  sendToExternalUserId,

  async notifyPurchaseCompleted(params: {
    buyerId: string;
    purchaseId: string;
    itemCount: number;
  }) {
    const shortId = params.purchaseId.slice(-8).toUpperCase();
    return sendToUserId(params.buyerId, {
      heading: "Purchase complete",
      message: `Order #${shortId} is confirmed. ${params.itemCount} item(s) are ready in your library.`,
      url: `${env.frontendUrl}/dashboard/purchases/${params.purchaseId}`,
      data: {
        type: "purchase.completed",
        purchaseId: params.purchaseId,
      },
    });
  },

  async notifyPurchaseFailed(params: { buyerId: string; purchaseId?: string }) {
    const shortId = params.purchaseId?.slice(-8).toUpperCase() ?? "unknown";
    return sendToUserId(params.buyerId, {
      heading: "Payment failed",
      message: `We could not process payment for order #${shortId}. Please retry checkout.`,
      url: `${env.frontendUrl}/dashboard/purchases`,
      data: {
        type: "purchase.failed",
        purchaseId: params.purchaseId ?? "",
      },
    });
  },

  async notifyCreatorSale(params: {
    creatorUserId: string;
    purchaseId: string;
    itemCount: number;
  }) {
    const shortId = params.purchaseId.slice(-8).toUpperCase();
    return sendToUserId(params.creatorUserId, {
      heading: "New sale",
      message: `${params.itemCount} item(s) sold in order #${shortId}.`,
      url: `${env.frontendUrl}/dashboard`,
      data: {
        type: "creator.sale",
        purchaseId: params.purchaseId,
      },
    });
  },

  async notifyBlockStatus(params: {
    creatorUserId: string;
    blockId: string;
    blockTitle: string;
    status: string;
  }) {
    const statusLabel = params.status.toLowerCase().replace(/_/g, " ");
    return sendToUserId(params.creatorUserId, {
      heading: "Block update",
      message: `"${params.blockTitle}" is now ${statusLabel}.`,
      url: `${env.frontendUrl}/dashboard/blocks/${params.blockId}`,
      data: {
        type: "block.status",
        blockId: params.blockId,
        status: params.status,
      },
    });
  },
};
