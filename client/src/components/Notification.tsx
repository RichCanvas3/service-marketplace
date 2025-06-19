import React, { useEffect, useState } from 'react';
import '../custom-styles.css';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 50);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match exit animation duration
  };

  const getNotificationIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`notification notification-${type} ${isVisible ? 'notification-visible' : ''} ${isExiting ? 'notification-exiting' : ''}`}>
      <div className="notification-backdrop" />
      <div className="notification-content">
        <div className="notification-icon">
          {getNotificationIcon()}
        </div>
        <div className="notification-text">
          <span className="notification-message">{message}</span>
        </div>
        <button className="notification-close" onClick={handleClose}>
          <span className="close-icon">×</span>
        </button>
      </div>
      <div className="notification-progress">
        <div
          className="notification-progress-bar"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );
};

export default Notification;