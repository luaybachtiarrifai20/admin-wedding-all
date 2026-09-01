import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { WeddingSelector } from '../components/WeddingSelector';
import { GuestForm } from '../components/GuestForm';
import { GuestList } from '../components/GuestList';

interface Guest {
  id: string;
  name: string;
  phone: string;
  isVip: boolean;
}

export const DashboardPage = () => {
  const [selectedWeddingId, setSelectedWeddingId] = useState<string | null>(null);
  const [selectedWeddingSlug, setSelectedWeddingSlug] = useState<string | null>(null);
  const [selectedBaseUrl, setSelectedBaseUrl] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>(undefined);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGuestAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleWeddingSelect = (weddingId: string, weddingSlug: string, baseUrl?: string) => {
    setSelectedWeddingId(weddingId);
    setSelectedWeddingSlug(weddingSlug);
    setSelectedBaseUrl(baseUrl);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
  };

  const handleCancelEdit = () => {
    setEditingGuest(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Wedding Guest Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <WeddingSelector
            onWeddingSelect={handleWeddingSelect}
            selectedWeddingId={selectedWeddingId}
          />
          {selectedWeddingId && selectedWeddingSlug && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <GuestForm
                  key={editingGuest?.id || 'new'}
                  onGuestAdded={handleGuestAdded}
                  weddingId={selectedWeddingId}
                  weddingSlug={selectedWeddingSlug}
                  baseUrl={selectedBaseUrl}          // ← dikirim ke form
                  editingGuest={editingGuest}
                  onCancelEdit={handleCancelEdit}
                />
              </div>
              <div className="space-y-6">
                <GuestList
                  key={refreshKey}
                  weddingId={selectedWeddingId}
                  onEditGuest={handleEditGuest}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};