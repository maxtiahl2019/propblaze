import React from 'react';
import { Notification } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface NotificationFeedProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  notifications,
  onMarkRead,
}) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No new notifications</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onMarkRead?.(notification.id)}
              >
                <div className="flex-1">
                  <Badge variant={notification.type === 'new_lead' ? 'success' : 'info'}>
                    {notification.type.replace('_', ' ')}
                  </Badge>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {notification.data.contact_name ||
                      notification.data.from_email ||
                      'New update'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
