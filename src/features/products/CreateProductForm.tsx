import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../api/client'
import { createProduct } from '../../api/products'
import type { Product } from '../../api/types'
import { productSchema, type ProductFormValues } from './productSchema'

export function CreateProductForm() {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState('')
  const { register, handleSubmit, reset, setError, watch, formState: { errors } } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema), defaultValues: { name: '', sku: '', description: '' } })
  const descriptionLength = watch('description')?.length ?? 0
  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (createdProduct) => { queryClient.setQueryData<Product[]>(['products'], (current = []) => [createdProduct, ...current]); reset(); setSuccessMessage('Товар добавлен в каталог.') },
    onError: (error) => {
      setSuccessMessage('')
      if (error instanceof ApiError) {
        Object.entries(error.fields).forEach(([field, message]) => { if (field === 'name' || field === 'sku' || field === 'description') setError(field, { type: 'server', message }) })
        if (error.status === 409) setError('sku', { type: 'server', message: 'Товар с таким SKU уже существует' })
      }
    },
  })
  const onSubmit = (values: ProductFormValues) => { setSuccessMessage(''); mutation.mutate({ name: values.name.trim(), sku: values.sku.trim(), ...(values.description.trim() ? { description: values.description.trim() } : {}) }) }

  return <section className="form-panel" aria-labelledby="create-product-title">
    <div className="section-kicker">Новый товар</div><h2 id="create-product-title">Добавить в каталог</h2><p className="section-copy">Укажите основные данные. Цены и магазины подключим на следующем этапе.</p>
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="field"><label htmlFor="name">Название</label><input id="name" placeholder="Например, iPhone 16 Pro" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} {...register('name')} />{errors.name && <span id="name-error" className="field-error">{errors.name.message}</span>}</div>
      <div className="field"><label htmlFor="sku">SKU</label><input id="sku" placeholder="IPHONE-16-PRO-256" aria-invalid={!!errors.sku} aria-describedby={errors.sku ? 'sku-error' : 'sku-help'} {...register('sku')} />{errors.sku ? <span id="sku-error" className="field-error">{errors.sku.message}</span> : <span id="sku-help" className="field-help">Уникальный внутренний код товара</span>}</div>
      <div className="field"><div className="label-row"><label htmlFor="description">Описание <span className="optional">необязательно</span></label><span className={descriptionLength > 1800 ? 'counter counter-warning' : 'counter'}>{descriptionLength}/2000</span></div><textarea id="description" rows={5} placeholder="Коротко опишите модель и комплектацию" aria-invalid={!!errors.description} aria-describedby={errors.description ? 'description-error' : undefined} {...register('description')} />{errors.description && <span id="description-error" className="field-error">{errors.description.message}</span>}</div>
      {mutation.isError && !(mutation.error instanceof ApiError && (mutation.error.status === 400 || mutation.error.status === 409)) && <div className="notice notice-error" role="alert">{mutation.error instanceof ApiError ? mutation.error.message : 'Не удалось добавить товар. Попробуйте ещё раз.'}</div>}
      {successMessage && <div className="notice notice-success" role="status">{successMessage}</div>}
      <button className="primary-button" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Сохраняем…' : 'Добавить товар'}</button>
    </form>
  </section>
}
