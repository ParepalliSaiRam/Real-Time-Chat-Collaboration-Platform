import { z } from "zod";

export const sendFriendRequestSchema = z.object({
    receiverId: z.string().min(1)
});

export const acceptFriendRequestSchema = z.object({
    requestId: z.string().min(1)
});

export const rejectFriendRequestSchema = z.object({
    requestId: z.string().min(1)
});
