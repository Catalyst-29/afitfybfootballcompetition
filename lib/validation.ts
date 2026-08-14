import { z } from 'zod';
export const playerSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  date_of_birth: z.string().min(10),
  jersey_number: z.coerce.number().int().min(1).max(99),
  position: z.enum(['Goalkeeper','Defender','Midfielder','Forward']),
  height_cm: z.coerce.number().int().min(140).max(240),
  preferred_foot: z.enum(['Right','Left'])
});
export const statusSchema = z.enum(['pending','approved','rejected']);
