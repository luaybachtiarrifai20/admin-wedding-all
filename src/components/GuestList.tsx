import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Guest {
  id: string;
  name: string;
  phone: string;
  isVip: boolean;
  invitationLink?: string;
  createdAt: unknown;
}

interface GuestListProps {
  weddingId: string;
  onEditGuest: (guest: Guest) => void;
}

export const GuestList: React.FC<GuestListProps> = ({ weddingId, onEditGuest }) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    const q = query(collection(db, 'weddings', weddingId, 'tamu_undangan'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const guestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Guest[];
      setGuests(guestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [weddingId]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await deleteDoc(doc(db, 'weddings', weddingId, 'tamu_undangan', id));
      } catch (error) {
        console.error('Error deleting guest:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Loading guests...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Guest List ({guests.length})</h3>
      {guests.length === 0 ? (
        <p className="text-gray-600">No guests added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VIP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invitation Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.isVip ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        VIP
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.invitationLink ? (
                      <div className="flex items-center space-x-2">
                        <span className="truncate max-w-xs text-blue-600">{guest.invitationLink}</span>
                        <button
                          onClick={() => copyToClipboard(guest.invitationLink!)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          title="Copy link"
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditGuest(guest)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
