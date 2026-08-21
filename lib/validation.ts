import { z } from 'zod';
export const playerSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required.').max(80, 'First name must be 80 characters or fewer.'),
  last_name: z.string().trim().min(1, 'Last name is required.').max(80, 'Last name must be 80 characters or fewer.'),
  date_of_birth: z.string().min(10, 'Date of birth is required.'),
  jersey_number: z.coerce.number({ invalid_type_error: 'Enter a valid jersey number.' }).int('Jersey number must be a whole number.').min(1, 'Jersey number must be between 1 and 99.').max(99, 'Jersey number must be between 1 and 99.'),
  position: z.enum(['Goalkeeper','Defender','Midfielder','Forward'], { errorMap: () => ({ message: 'Please select a playing position.' }) }),
  height_cm: z.coerce.number({ invalid_type_error: 'Enter a valid height.' }).int('Height must be a whole number.').min(140, 'Height must be at least 140 cm.').max(240, 'Height must not exceed 240 cm.'),
  preferred_foot: z.enum(['Right','Left'], { errorMap: () => ({ message: 'Please select a preferred foot.' }) })
});
export const statusSchema = z.enum(['pending','approved','rejected']);
