import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await res.json();
        setUser(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <img
          src={user.profilePicture || '/default-avatar.png'}
          alt={user.username}
          className="w-20 h-20 object-cover bg-gray-500 rounded-full"
        />
        <div className="ml-4">
          <h1 className="text-2xl font-semibold">{user.email || 'Anonymous'}</h1>
          <p className="text-gray-500">@{user.username}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl mb-2">Followers</h2>
          <p>{user.followers?.length || 0}</p>
        </div>
        <div>
          <h2 className="text-xl mb-2">Following</h2>
          <p>{user.following?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
