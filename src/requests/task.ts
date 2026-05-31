import { z } from "zod";

export const SaveTaskRequest = z.object({
    name: z.string().min(5).max(255),
    description: z.string().nonempty(),
});

export type SaveTaskRequest = z.infer<typeof SaveTaskRequest>
