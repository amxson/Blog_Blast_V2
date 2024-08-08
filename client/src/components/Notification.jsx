import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Notification = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchNotificationCounts = async () => {
      try {
        const response = await axios.get('/api/notifications/counts', {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
          },
        });
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchNotificationCounts();
  }, [currentUser]);

  const handleBellClick = async () => {
    navigate('/dashboard?tab=notifications');
  }

  return (
    <header className="header">
      <div className="header-content">
        {/* Other header content */}

        <div className="notification-icon"  onClick={handleBellClick}>
          <span className={`icon ${unreadCount > 0 ? 'glowing-red' : ''}`}>🔔</span>
          {unreadCount > 0 && (
            <div className="notification-counter">
              {unreadCount}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Notification;
