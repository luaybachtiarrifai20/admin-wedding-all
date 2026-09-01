import { useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Guest {
  id?: string;
  name: string;
  phone: string;
  isVip: boolean;
  invitationLink?: string;
}

interface GuestFormProps {
  onGuestAdded: () => void;
  weddingId: string;
  weddingSlug: string;
  baseUrl?: string;                 // ← prop baru
  editingGuest?: Guest;
  onCancelEdit?: () => void;
}

export const GuestForm: React.FC<GuestFormProps> = ({
  onGuestAdded,
  weddingId,
  weddingSlug,
  baseUrl,
  editingGuest,
  onCancelEdit,
}) => {
  const [name, setName] = useState(editingGuest?.name || '');
  const [phone, setPhone] = useState(editingGuest?.phone || '');
  const [isVip, setIsVip] = useState(editingGuest?.isVip || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInvitationLink = (guestName: string): string => {
    const guestSlug = guestName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');

    // Pakai baseUrl dari wedding, kalau tidak ada pakai default
    const domain = baseUrl || 'https://wedding01-teal.vercel.app';
    return `${domain}/${weddingSlug}?to=${guestSlug}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const invitationLink = generateInvitationLink(name);

      if (editingGuest?.id) {
        // Update existing guest
        await updateDoc(doc(db, 'weddings', weddingId, 'tamu_undangan', editingGuest.id), {
          name: name.trim(),
          phone: phone.trim(),
          isVip: isVip,
          invitationLink: invitationLink,
        });
      } else {
        // Add new guest
        await addDoc(collection(db, 'weddings', weddingId, 'tamu_undangan'), {
          name: name.trim(),
          phone: phone.trim(),
          isVip: isVip,
          invitationLink: invitationLink,
          createdAt: serverTimestamp(),
        });
      }

      setName('');
      setPhone('');
      setIsVip(false);
      onGuestAdded();
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      setError(editingGuest ? 'Failed to update guest. Please try again.' : 'Failed to add guest. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {editingGuest ? 'Edit Guest' : 'Add New Guest'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Guest Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., 08123456789"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isVip"
            checked={isVip}
            onChange={(e) => setIsVip(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isVip" className="ml-2 block text-sm text-gray-700">
            VIP Guest
          </label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? editingGuest
                ? 'Updating...'
                : 'Adding...'
              : editingGuest
              ? 'Update Guest'
              : 'Add Guest'}
          </button>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};