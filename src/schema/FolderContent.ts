import {z} from "zod";

//Note: You can add error messages for URL etc.
export const FolderContentSchema = z.array(
    z.object({
        name: z.string(),
        sha: z.string(),
        download_url: z.string().url()
    })
);

export type FolderContent = z.infer<typeof FolderContentSchema>;