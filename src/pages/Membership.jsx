import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes, FaCrown, FaMusic } from 'react-icons/fa';
import { auth, db } from '../services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import './Membership.css';

const Membership = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Cargar el plan actual del usuario
  useEffect(() => {
    const loadCurrentPlan = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const perfilRef = doc(db, 'perfiles', user.uid);
          const perfilSnap = await getDoc(perfilRef);
          if (perfilSnap.exists()) {
            const perfil = perfilSnap.data();
            const plan = perfil.planActual || perfil.membershipPlan || null;
            setCurrentPlan(plan);
          }
        } catch (error) {
          console.error('Error al cargar plan actual:', error);
        }
      }
    };
    
    loadCurrentPlan();
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      icon: <FaMusic />,
      features: [
        { text: '5 mensajes por día', included: true },
        { text: '20 mensajes en chat por día', included: true },
        { text: '1 publicación por día', included: true },
        { text: '1 evento por día', included: true },
        { text: '1 comentario por publicación', included: true },
        { text: 'Reacciones ilimitadas', included: false },
        { text: 'Duración: Ilimitada', included: true },
      ],
      buttonText: 'Continuar Gratis',
      buttonClass: 'btn-free',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29990,
      icon: <FaCrown />,
      features: [
        { text: 'Mensajes ilimitados', included: true },
        { text: 'Chat ilimitado', included: true },
        { text: 'Publicaciones ilimitadas', included: true },
        { text: 'Eventos ilimitados', included: true },
        { text: 'Comentarios ilimitados', included: true },
        { text: 'Reacciones ilimitadas', included: true },
        { text: 'Duración: 30 días', included: true },
      ],
      buttonText: 'Obtener Premium',
      buttonClass: 'btn-premium',
      badge: 'Recomendado',
    },
  ];

  const handleSelectPlan = async (planId) => {
    setLoading(true);
    
    // Si es Premium, redirigir a la página de pago
    if (planId === 'premium') {
      navigate('/payment');
      setLoading(false);
      return;
    }
    
    // Si es Free, actualizar directamente y redirigir al perfil
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'perfiles', user.uid);
        await updateDoc(userRef, {
          planActual: planId,
          membershipPlan: planId,
          membershipStartDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      navigate('/profile');
    } catch (error) {
      console.error('Error al seleccionar plan:', error);
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="membership-container">
      <div className="membership-background">
        <h1 className="membership-logo">
          <span className="logo-band">BAND</span>
          <span className="logo-social">SOCIAL</span>
        </h1>

        <div className="membership-header">
          <h2 className="membership-title">Elige tu plan</h2>
          <p className="membership-subtitle">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="plans-container">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${
                plan.id === 'premium' ? 'premium-card' : ''
              } ${currentPlan === plan.id ? 'current-plan' : ''}`}
            >
              {currentPlan === plan.id && (
                <div className="plan-badge" style={{ background: '#28a745' }}>
                  <span>Tu Plan Actual</span>
                </div>
              )}
              {plan.badge && currentPlan !== plan.id && (
                <div className="plan-badge">
                  <span>{plan.badge}</span>
                </div>
              )}

              <div className="plan-header">
                <div className="plan-icon">{plan.icon}</div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  {plan.price === 0 ? (
                    <span className="price-free">Gratis</span>
                  ) : (
                    <>
                      <span className="price-currency">$</span>
                      <span className="price-amount">{plan.price.toLocaleString('es-CO')}</span>
                      <span className="price-period"> COP/mes</span>
                    </>
                  )}
                </div>
              </div>

              <div className="plan-features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-icon">
                      {feature.included ? (
                        <FaCheck className="icon-check" />
                      ) : (
                        <FaTimes className="icon-times" />
                      )}
                    </div>
                    <span className={feature.included ? '' : 'feature-disabled'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={`plan-button ${plan.buttonClass}`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading || currentPlan === plan.id}
              >
                {currentPlan === plan.id 
                  ? 'Plan Actual' 
                  : loading && selectedPlan === plan.id 
                    ? 'Procesando...' 
                    : plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="membership-footer">
          <Button
            className="btn-continue-free"
            onClick={() => navigate('/publicaciones')}
            variant="outline-light"
          >
            Continuar sin seleccionar plan
          </Button>
          <p className="mt-3">Puedes cambiar tu plan en cualquier momento desde tu perfil</p>
        </div>
      </div>
    </div>
  );
};

export default Membership;
