import React, { useState } from 'react';
import api from '../services/api';
import { Package, Lock, Mail, User, MapPin, ArrowRight, ChevronRight } from 'lucide-react';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/Access/login' : '/Access/signup';
      const payload = isLogin ? { email, password } : { 
        email, 
        password, 
        firstName, 
        lastName,
        address: { street, city, country }
      };

      const { data } = await api.post(endpoint, payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      setUser({ role: data.role });
    } catch (err) {
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        setError(validationErrors[0]);
      } else {
        setError(err.response?.data?.message || err.response?.data?.Message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '2rem'
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: isLogin ? '440px' : '500px', 
        padding: '2.25rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            background: 'var(--primary)',
            width: '56px', 
            height: '56px', 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Package size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>
            Warehouse Manager
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={!isLogin} 
                />
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '3rem' }}
              autoComplete="email"
              required 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '3rem' }}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required 
            />
          </div>

          {!isLogin && (
            <>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Street Address" 
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  style={{ paddingLeft: '3rem' }}
                  required={!isLogin} 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="City" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required={!isLogin} 
                />
                <input 
                  type="text" 
                  placeholder="Country" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required={!isLogin} 
                />
              </div>
            </>
          )}

          {error && (
            <div style={{ 
              padding: '0.75rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '12px',
              color: 'var(--error)',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', height: '52px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={handleToggleMode} 
            style={{ 
              background: 'transparent', 
              color: 'var(--text-muted)', 
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '0.5rem',
              gap: '0.25rem'
            }}
          >
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
              {isLogin ? 'Create one' : 'Sign in'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
