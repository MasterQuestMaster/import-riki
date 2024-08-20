import {z} from "zod";

//Single Set information, for creating and reading sets.
export const SetInfoSchema = z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string().nullish(),
    type: z.string().nullish(),
    releaseDate: z.coerce.date().nullish(),
    sha: z.string().nullish()
});

//Partial Version for Updates
export const SetInfoUpdateSchema = SetInfoSchema.omit({id: true}).partial();

//Inferred Types
export type SetInfo = z.infer<typeof SetInfoSchema>;
export type SetInfoUpdate = z.infer<typeof SetInfoUpdateSchema>;