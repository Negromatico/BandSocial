import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Alert } from 'react-bootstrap';
import { FaCreditCard, FaUser, FaLock, FaCrown, FaArrowLeft } from 'react-icons/fa';
import { auth, db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const planPrice = 29990;
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatear número de tarjeta
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    }

    // Formatear fecha de expiración
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    }

    // Limitar CVV a 3 dígitos
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData({ ...formData, [name]: formattedValue });
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }

    if (!formData.cardName || formData.cardName.trim().length < 3) {
      newErrors.cardName = 'Nombre del titular requerido';
    }

    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Fecha inválida (MM/AA)';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Mes inválido';
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Tarjeta vencida';
      }
    }

    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Simular procesamiento de pago (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Actualizar el plan del usuario en Firestore
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'perfiles', user.uid);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        await updateDoc(userRef, {
          membershipPlan: 'premium',
          membershipStartDate: startDate.toISOString(),
          membershipEndDate: endDate.toISOString(),
          lastPaymentDate: startDate.toISOString(),
          lastPaymentAmount: planPrice,
          updatedAt: new Date().toISOString(),
        });
      }

      // Redirigir al perfil con mensaje de éxito
      navigate('/profile', { state: { paymentSuccess: true } });
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setPaymentError('Error al procesar el pago. Por favor, intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-background">
        <h1 className="payment-logo">
          <span className="logo-band">BAND</span>
          <span className="logo-social">SOCIAL</span>
        </h1>

        <div className="payment-card">
          <button className="back-button" onClick={() => navigate('/membership')}>
            <FaArrowLeft /> Volver
          </button>

          <div className="payment-header">
            <div className="premium-badge-large">
              <FaCrown className="crown-icon" />
              <h2 className="payment-title">Plan Premium</h2>
            </div>
            <div className="payment-amount">
              <span className="amount-currency">$</span>
              <span className="amount-value">{planPrice.toLocaleString('es-CO')}</span>
              <span className="amount-period"> COP/mes</span>
            </div>
            <p className="payment-subtitle">30 días de acceso ilimitado</p>
          </div>

          <Form onSubmit={handleSubmit} className="payment-form">
            <Form.Group className="mb-3">
              <Form.Label className="form-label">Número de Tarjeta</Form.Label>
              <div className="input-icon-wrapper">
                <FaCreditCard className="input-icon" />
                <Form.Control
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className={`input-with-icon ${errors.cardNumber ? 'is-invalid' : ''}`}
                />
              </div>
              {errors.cardNumber && (
                <div className="error-message">{errors.cardNumber}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label">Nombre del Titular</Form.Label>
              <div className="input-icon-wrapper">
                <FaUser className="input-icon" />
                <Form.Control
                  type="text"
                  name="cardName"
                  placeholder="JUAN PÉREZ"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  className={`input-with-icon ${errors.cardName ? 'is-invalid' : ''}`}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              {errors.cardName && (
                <div className="error-message">{errors.cardName}</div>
              )}
            </Form.Group>

            <div className="row">
              <div className="col-6">
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Fecha de Expiración</Form.Label>
                  <Form.Control
                    type="text"
                    name="expiryDate"
                    placeholder="MM/AA"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={`payment-input ${errors.expiryDate ? 'is-invalid' : ''}`}
                  />
                  {errors.expiryDate && (
                    <div className="error-message">{errors.expiryDate}</div>
                  )}
                </Form.Group>
              </div>

              <div className="col-6">
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">CVV</Form.Label>
                  <div className="input-icon-wrapper">
                    <FaLock className="input-icon" />
                    <Form.Control
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className={`input-with-icon ${errors.cvv ? 'is-invalid' : ''}`}
                    />
                  </div>
                  {errors.cvv && (
                    <div className="error-message">{errors.cvv}</div>
                  )}
                </Form.Group>
              </div>
            </div>

            {paymentError && (
              <Alert variant="danger" className="payment-alert">
                {paymentError}
              </Alert>
            )}

            <div className="payment-summary">
              <div className="summary-row">
                <span>Plan Premium (30 días)</span>
                <span>${planPrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="summary-row total">
                <span>Total a Pagar</span>
                <span>${planPrice.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="btn-payment"
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Procesando Pago...
                </>
              ) : (
                <>
                  <FaCrown className="me-2" />
                  Confirmar Pago
                </>
              )}
            </Button>

            <div className="payment-security">
              <FaLock className="security-icon" />
              <span>Pago seguro y encriptado</span>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
