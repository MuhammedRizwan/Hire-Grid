// components/Dashboard/StatsCards.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Mail, Calendar, CheckCircle, XCircle, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Stats {
  total: number;
  applied: number;
  followUp: number;
  interview: number;
  rejected: number;
  offer: number;
}

interface StatsCardsProps {
  stats: Stats;
}

const statItems = [
  { key: 'total', label: 'Total Applications', icon: Briefcase, color: 'blue' },
  { key: 'applied', label: 'Applied', icon: Mail, color: 'yellow' },
  { key: 'followUp', label: 'Follow-up', icon: Calendar, color: 'purple' },
  { key: 'interview', label: 'Interview', icon: Calendar, color: 'green' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' },
  { key: 'offer', label: 'Offers', icon: Award, color: 'emerald' },
];

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const value = stats[item.key as keyof Stats];
        
        const colorClasses = {
          blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
          yellow: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400',
          purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
          green: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400',
          red: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400',
          emerald: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
        };
        
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};