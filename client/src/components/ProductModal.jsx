import React, { useEffect, useState } from 'react';

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [rating, setRating] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initialProduct?.name ?? '');
    setCategory(initialProduct?.category ?? '');
    setDescription(initialProduct?.description ?? '');
    setPrice(initialProduct?.price != null ? String(initialProduct.price) : '');
    setStock(initialProduct?.stock != null ? String(initialProduct.stock) : '');
    setRating(initialProduct?.rating != null ? String(initialProduct.rating) : '');
    setImage(initialProduct?.image ?? '');
  }, [open, initialProduct]);

  if (!open) return null;

  const title = mode === 'edit' ? 'Редактирование товара' : 'Создание товара';

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedDesc = description.trim();
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedRating = rating ? Number(rating) : 0;
    const trimmedImage = image.trim() || 'https://via.placeholder.com/150?text=Product';

    if (!trimmedName) {
      alert('Введите название товара');
      return;
    }
    if (!trimmedCategory) {
      alert('Введите категорию');
      return;
    }
    if (!trimmedDesc) {
      alert('Введите описание');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      alert('Введите корректную цену (неотрицательное число)');
      return;
    }
    if (!Number.isFinite(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
      alert('Введите корректное количество на складе (целое неотрицательное число)');
      return;
    }

    onSubmit({
      id: initialProduct?.id,
      name: trimmedName,
      category: trimmedCategory,
      description: trimmedDesc,
      price: parsedPrice,
      stock: parsedStock,
      rating: parsedRating,
      image: trimmedImage,
    });
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Название *
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Ноутбук"
              autoFocus
            />
          </label>
          <label className="label">
            Категория *
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Например, Электроника"
            />
          </label>
          <label className="label">
            Описание *
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание"
            />
          </label>
          <label className="label">
            Цена *
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Например, 999.99"
            />
          </label>
          <label className="label">
            Количество на складе *
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Например, 10"
            />
          </label>
          <label className="label">
            Рейтинг (0-5)
            <input
              className="input"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Например, 4.5"
            />
          </label>
          <label className="label">
            URL изображения
            <input
              className="input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </label>
          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              {mode === 'edit' ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}