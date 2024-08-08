import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table } from 'flowbite-react';

export default function DashFollowing() {
  const { currentUser } = useSelector((state) => state.user);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        // Fetch the list of users being followed
        const res = await fetch(`/api/user/${currentUser._id}/following`);
        const data = await res.json();

        if (res.ok) {
          // Fetch detailed information for each followed user
          const followingDetails = await Promise.all(
            data.map(async (followed) => {
              try {
                // Fetch each followed user's detailed information
                const userRes = await fetch(`/api/user/${followed._id}`);
                const userData = await userRes.json();
                return { ...followed, profilePicture: userData.profilePicture };
              } catch (error) {
                console.log(`Error fetching details for followed user ${followed._id}:`, error.message);
                return { ...followed, profilePicture: 'default-profile-picture-url' }; // Fallback
              }
            })
          );
          setFollowing(followingDetails);
        }
        setLoading(false);
      } catch (error) {
        console.log(error.message);
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [currentUser._id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 flex-grow flex flex-col" style={{ margin: "1em auto" }}>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold text-gray-700 dark:text-gray-300'>
          Following
        </h2>
        <div className='text-5xl font-extrabold text-teal-500'>
          {following.length}
        </div>
      </div>
      <div className='table-auto md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
        <Table hoverable className='shadow-md'>
          <Table.Head>
            <Table.HeadCell>Following</Table.HeadCell>
            <Table.HeadCell>Profile Image</Table.HeadCell>
            <Table.HeadCell>Username</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            {following.map((followed) => (
              <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800' key={followed._id}>
                <Table.Cell>
                  <Link to={`/user/${followed._id}`} className='text-blue-500'>
                    {followed.username}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <img
                    src={followed.profilePicture || 'default-profile-picture-url'}
                    alt={followed.username}
                    className='w-10 h-10 object-cover bg-gray-500 rounded-full'
                  />
                </Table.Cell>
                <Table.Cell>{followed.username}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
