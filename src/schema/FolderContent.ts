import {z} from "zod";

//Github API folder content
export const FolderContentSchema = z.array(
    z.object({
        name: z.string(),
        sha: z.string(),
        download_url: z.string().url()
    })
);

//Inferred Types
export type FolderContent = z.infer<typeof FolderContentSchema>;