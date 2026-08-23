import { z } from 'zod'
export const productSchema = z.object({ name: z.string().trim().min(1, 'Введите название товара').max(200, 'Не более 200 символов'), sku: z.string().trim().min(1, 'Введите SKU').max(100, 'Не более 100 символов'), description: z.string().max(2000, 'Не более 2000 символов') })
export type ProductFormValues = z.infer<typeof productSchema>
