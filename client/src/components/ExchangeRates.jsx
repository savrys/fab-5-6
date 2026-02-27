import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function ExchangeRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const data = await api.getExchangeRates();
        setRates(data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить курсы валют');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  if (loading) return <div className="exchange-rates">Загрузка курсов...</div>;
  if (error) return <div className="exchange-rates error">{error}</div>;
  if (!rates) return null;

  return (
    <div className="exchange-rates">
      <h3>Курсы валют к USD (на {rates.date})</h3>
      <ul>
        <li>EUR: {rates.rates.EUR}</li>
        <li>GBP: {rates.rates.GBP}</li>
        <li>JPY: {rates.rates.JPY}</li>
        <li>RUB: {rates.rates.RUB}</li>
        <li>CNY: {rates.rates.CNY}</li>
      </ul>
    </div>
  );
}