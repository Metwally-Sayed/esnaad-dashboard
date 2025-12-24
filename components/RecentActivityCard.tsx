import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, UserPlus, Home, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'lease' | 'tenant' | 'unit' | 'alert';
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'lease',
    title: 'New lease signed',
    description: 'Unit 304 - Riverside Apartments',
    time: '2 hours ago',
  },
  {
    id: '2',
    type: 'tenant',
    title: 'New tenant registered',
    description: 'Sarah Johnson - Downtown Plaza',
    time: '5 hours ago',
  },
  {
    id: '3',
    type: 'unit',
    title: 'Unit marked as vacant',
    description: 'Unit 512 - Sunset Heights',
    time: '1 day ago',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Maintenance request',
    description: 'Unit 204 - Harbor View Complex',
    time: '1 day ago',
  },
];

export function RecentActivityCard() {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'lease':
        return FileText;
      case 'tenant':
        return UserPlus;
      case 'unit':
        return Home;
      case 'alert':
        return AlertCircle;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p>{activity.title}</p>
                  <p className="text-muted-foreground text-sm truncate">{activity.description}</p>
                  <p className="text-muted-foreground text-sm mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
