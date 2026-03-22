import React from 'react';

export default function ProductItem({ product, onEdit, onDelete, canEdit, canDelete }) {
  return (
    <div className="productRow">
      <div className="productRow__image">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="productRow__info">
        <div className="productRow__name">{product.title}</div>   {/* название */}
        <div className="productRow__category">{product.category}</div>
        <div className="productRow__description">{product.description}</div>
        <div className="productRow__price">{product.price} ₽</div>
        <div className="productRow__stock">Осталось: {product.stock}</div>
      </div>
      <div className="productRow__actions">
        {canEdit && (
          <button className="btn" onClick={() => onEdit(product)}>
            Редактировать
          </button>
        )}
        {canDelete && (
          <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}