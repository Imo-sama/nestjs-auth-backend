import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = 'http://localhost:3000';

function TwoFactorSetup({ token }) {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1); // 1: enable, 2: verify
  const [password, setPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/auth/2fa/enable`, {
        email: user.email,
        password,
      });
      setSecret(data.secret);
      setQrCode(data.qrCode);
      setStep(2);
      setSuccess('Scan the QR code with Google Authenticator app!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate 2FA secret');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/2fa/verify`, {
        email: user.email,
        code: verifyCode,
      });
      setSuccess('2FA enabled successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/2fa/disable`, {
        email: user.email,
        password,
        code: disableCode,
      });
      setSuccess('2FA disabled successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Two-Factor Authentication</h1>
          <p className="text-gray-400 mt-2">
            {user.twoFactorEnabled ? 'Manage your 2FA settings' : 'Add extra security to your account'}
          </p>
        </div>

        {/* Enable 2FA */}
        {!user.twoFactorEnabled && step === 1 && (
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6">Step 1: Enable 2FA</h2>
            
            <form onSubmit={handleEnable2FA} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Your Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Generating...' : 'Generate QR Code'}
              </button>
            </form>
          </div>
        )}

        {/* Verify 2FA */}
        {!user.twoFactorEnabled && step === 2 && (
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6">Step 2: Scan QR Code</h2>
            
            {/* QR Code */}
            <div className="bg-white p-6 rounded-lg mb-6 text-center">
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="mx-auto" style={{ maxWidth: '300px' }} />
              ) : (
                <QRCodeSVG value={secret || 'loading'} size={256} />
              )}
            </div>

            <div className="bg-primary-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300 mb-2">Secret Key (manual entry):</p>
              <code className="text-white font-mono text-sm break-all">{secret}</code>
            </div>

            {success && (
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-sm mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter 6-Digit Code from Google Authenticator
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
              </button>
            </form>
          </div>
        )}

        {/* Disable 2FA */}
        {user.twoFactorEnabled && (
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6">Disable Two-Factor Authentication</h2>
            
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6">
              ✅ 2FA is currently enabled on your account
            </div>

            <form onSubmit={handleDisable2FA} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current 2FA Code
                </label>
                <input
                  type="text"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all">
                {loading ? 'Disabling...' : 'Disable 2FA'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default TwoFactorSetup;
