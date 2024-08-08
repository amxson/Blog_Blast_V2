import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import DashPosts from '../components/DashPosts';
import DashNotification from '../components/DashNotification';
import DashUsers from '../components/DashUsers';
import DashComments from '../components/DashComments';
import DashFollowers from '../components/DashFollowers';
import DashFollowing from '../components/DashFollowing';
import DashboardComp from '../components/DashboardComp';

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('posts'); // Default to 'posts' tab

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <div className='md:w-56'>
        {/* Sidebar */}
        <DashSidebar />
      </div>
      {/* Render the corresponding component based on the tab */}
      
      {tab === 'profile' && <DashProfile />}
      {tab === 'notifications' && <DashNotification />}
      {tab === 'posts' && <DashPosts />}
      {tab === 'users' && <DashUsers />}
      {tab === 'comments' && <DashComments />}
      {tab === 'followers' && <DashFollowers />}
      {tab === 'following' && <DashFollowing />}
      {tab === 'dash' && <DashboardComp />}
    </div>
  );
}
