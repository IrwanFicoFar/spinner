import { z } from 'zod';
const name=z.string().trim().min(1).max(100);
export const commandSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('settings'),name:name.optional(),mode:z.enum(['general','participant']).optional(),control:z.enum(['public','admin']).optional(),advance:z.enum(['manual','auto']).optional(),live:z.boolean().optional(),onboarded:z.literal(true).optional()}),
 z.object({type:z.literal('select'),id:z.string().max(100)}),
 z.object({type:z.literal('product'),product:z.object({id:z.string().max(100),name,icon:z.string().min(1).max(20),stock:z.number().int().min(0).max(999)})}),
 z.object({type:z.literal('participant'),person:z.object({id:z.string().max(100),name,mode:z.enum(['include','exclude']),productIds:z.array(z.string().max(100)).max(1000)})}),
 z.object({type:z.literal('delete'),kind:z.enum(['product','participant']),id:z.string().max(100)}),
 z.object({type:z.literal('spin'),requestId:z.string().uuid(),participantId:z.string().max(100)}),
 z.object({type:z.literal('confirm'),id:z.string().uuid()}),
]);
export type Command=z.infer<typeof commandSchema>;
