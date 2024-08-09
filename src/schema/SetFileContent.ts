import {z} from "zod";

export const SetFileContentSchema = z.array(
    z.object({
        name: z.string(),
        code: z.string(),
        rarity: z.string(),
        expansion: z.string(),
        side: z.string(),
        type: z.string(),
        color: z.string(),
        level: z.string(),
        cost: z.string(),
        power: z.string(),
        soul: z.number(),
        trigger: z.array(z.string()),
        attributes: z.array(z.string()),
        ability: z.array(z.string()),
        flavor_text: z.string(),
        set: z.string(),
        release: z.string(),
        sid: z.string(),
        image: z.string().url()
    })
);

export type FolderContent = z.infer<typeof SetFileContentSchema>;