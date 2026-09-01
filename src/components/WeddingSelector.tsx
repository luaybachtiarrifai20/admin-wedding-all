import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Wedding {
  id: string;
  brideName: string;
  groomName: string;
  slug: string;
  baseUrl?: string;        // ← field baru
  otp?: string;
  createdAt: unknown;
}

interface WeddingSelectorProps {
  onWeddingSelect: (weddingId: string, weddingSlug: string, baseUrl?: string) => void;
  selectedWeddingId: string | null;
}

export const WeddingSelector: React.FC<WeddingSelectorProps> = ({ onWeddingSelect, selectedWeddingId }) => {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'weddings'), (snapshot) => {
      const weddingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Wedding[];
      setWeddings(weddingsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOtpChange = (weddingId: string, value: string) => {
    setOtpInputs((prev) => ({ ...prev, [weddingId]: value }));
    setOtpErrors((prev) => ({ ...prev, [weddingId]: '' }));
  };

  const handleWeddingClick = (wedding: Wedding) => {
    if (wedding.otp) {
      const enteredOtp = otpInputs[wedding.id];
      if (!enteredOtp) {
        setOtpErrors((prev) => ({ ...prev, [wedding.id]: 'Please enter OTP' }));
        return;
      }
      if (enteredOtp !== wedding.otp) {
        setOtpErrors((prev) => ({ ...prev, [wedding.id]: 'Invalid OTP' }));
        return;
      }
    }
    // Kirim juga baseUrl
    onWeddingSelect(wedding.id, wedding.slug, wedding.baseUrl);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Loading weddings...</p>
      </div>
    );
  }

  if (weddings.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">No weddings found. Please create a wedding first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Select Wedding</h3>
      <div className="space-y-2">
        {weddings.map((wedding) => (
          <div
            key={wedding.id}
            className={`p-4 rounded-md border transition-colors ${
              selectedWeddingId === wedding.id
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            <button
              onClick={() => handleWeddingClick(wedding)}
              className="w-full text-left"
            >
              <div className="font-medium text-gray-900">
                {wedding.groomName} & {wedding.brideName}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Slug: {wedding.slug}
              </div>
              {/* {wedding.baseUrl && (
                <div className="text-sm text-blue-600 mt-1">
                  Domain: {wedding.baseUrl}
                </div>
              )} */}
            </button>
            {wedding.otp && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Enter OTP code"
                  value={otpInputs[wedding.id] || ''}
                  onChange={(e) => handleOtpChange(wedding.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                {otpErrors[wedding.id] && (
                  <p className="text-red-500 text-xs mt-1">{otpErrors[wedding.id]}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};