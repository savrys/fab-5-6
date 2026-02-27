import React from 'react';

export default function ProductItem({ product, onEdit, onDelete }) {
  return (
    <div className="productRow">
      <div className="productRow__image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="productRow__info">
        <div className="productRow__id">#{product.id}</div>
        <div className="productRow__name">{product.name}</div>
        <div className="productRow__category">{product.category}</div>
        <div className="productRow__description">{product.description}</div>
        <div className="productRow__price">{product.price} ₽</div>
        <div className="productRow__stock">Осталось: {product.stock}</div>
      </div>
      <div className="productRow__actions">
        <button className="btn" onClick={() => onEdit(product)}>
          Редактировать
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
}