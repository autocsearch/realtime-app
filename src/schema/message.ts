import z from "zod";

export const MessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string(),
  timestamp: z.number(),
});

export const MessageArraySchema = z.array(MessageSchema);

export type Message = z.infer<typeof MessageSchema>;
