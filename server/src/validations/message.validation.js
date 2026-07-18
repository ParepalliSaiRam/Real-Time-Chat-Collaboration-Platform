import { z } from "zod";

export const sendMessageSchema = z.object({

    content: z
        .string()
        .trim()
        .min(1)
        .max(2000)

});

export const editMessageSchema = z.object({

    content: z
        .string()
        .trim()
        .min(1)
        .max(2000)

});