import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table } from 'flowbite-react';

export default function DashFollowers() {
  const { currentUser } = useSelector((state) => state.user);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await fetch(`/api/user/${currentUser._id}/followers`);
        const data = await res.json();
        if (res.ok) {
          const followerDetails = await Promise.all(
            data.map(async (follower) => {
              try {
                const userRes = await fetch(`/api/user/${follower._id}`);
                const userData = await userRes.json();
                return { ...follower, profilePicture: userData.profilePicture };
              } catch (error) {
                console.log(`Error fetching details for follower ${follower._id}:`, error.message);
                return { ...follower, profilePicture: 'default-profile-picture-url' }; // Fallback
              }
            })
          );
          setFollowers(followerDetails);
        }
        setLoading(false);
      } catch (error) {
        console.log(error.message);
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [currentUser._id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 flex-grow flex flex-col" style={{ margin: "1em auto" }}>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold text-gray-700 dark:text-gray-300'>
          Followers
        </h2>
        <div className='text-5xl font-extrabold text-teal-500'>
          {followers.length}
        </div>
      </div>
      <div className='table-auto md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
        <Table hoverable className='shadow-md'>
          <Table.Head>
            <Table.HeadCell>Follower</Table.HeadCell>
            <Table.HeadCell>Profile Image</Table.HeadCell>
            <Table.HeadCell>Username</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            {followers.map((follower) => (
              <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800' key={follower._id}>
                <Table.Cell>
                  <Link to={`/user/${follower._id}`} className='text-blue-500'>
                    {follower.username}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <img
                    src={follower.profilePicture || 'default-profile-picture-url'}
                    alt={follower.username}
                    className='w-10 h-10 object-cover bg-gray-500 rounded-full'
                  />
                </Table.Cell>
                <Table.Cell>{follower.username}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
