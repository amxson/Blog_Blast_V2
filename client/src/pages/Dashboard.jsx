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
import DashboardComp from '../../../../mern-blog/client/src/components/DashboardComp';

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

  const renderContent = () => {
    switch (tab) {
      case 'profile':
        return <DashProfile />;
      case 'notifications':
        return <DashNotification />;
      case 'posts':
        return <DashPosts />;
      case 'users':
        return <DashUsers />;
      case 'comments':
        return <DashComments />;
      case 'followers':
        return <DashFollowers />;
      case 'following':
        return <DashFollowing />;
      case 'dash':
        return <DashboardComp />;
      default:
        return <DashPosts />; // Fallback to 'posts'
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        {/* Sidebar */}
        <DashSidebar />
      </div>
      <div className="flex-1">
        {/* Render the corresponding component based on the tab */}
        {renderContent()}
      </div>
    </div>
  );
}
