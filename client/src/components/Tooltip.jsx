// Tooltip.jsx
import React from 'react';
import '../index.css'; // Ensure to add styles for the tooltip

const Tooltip = ({ notifications }) => {
  return (
    <div className="tooltip">
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li key={notification._id}>
              {notification.type === 'like' ? '👍' : '💬'} {notification.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tooltip;
