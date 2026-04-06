// components/Applications/KanbanBoard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { IJobApplication } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Building2 } from 'lucide-react';
import { format } from 'date-fns';

interface KanbanBoardProps {
  applications: IJobApplication[];
  onUpdateStatus: (id: string, status: string) => void;
}

const columns = [
  { id: 'applied', title: 'Applied', color: 'blue' },
  { id: 'follow-up', title: 'Follow-up', color: 'yellow' },
  { id: 'interview', title: 'Interview', color: 'purple' },
  { id: 'offer', title: 'Offer', color: 'green' },
  { id: 'rejected', title: 'Rejected', color: 'red' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onUpdateStatus,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // prevent accidental drags
      },
    })
  );

  const getColumnApplications = (status: string) => {
    return applications.filter((app) => app.status === status);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const newStatus = over.id as string; // droppableId = column id

    // Only update if the status actually changed
    const draggedApp = applications.find((app) => app._id === active.id);
    if (draggedApp && draggedApp.status !== newStatus) {
      onUpdateStatus(active.id as string, newStatus);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnApps = getColumnApplications(column.id);

          return (
            <div key={column.id} className="min-w-[280px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.title}
                </h3>
                <Badge variant="secondary">{columnApps.length}</Badge>
              </div>

              <DroppableColumn id={column.id}>
                {columnApps.map((app) => (
                  <DraggableCard key={app._id} app={app} />
                ))}
              </DroppableColumn>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
};

import { useDroppable } from '@dnd-kit/core';

const DroppableColumn: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-lg p-2 min-h-[500px] transition-colors border border-dashed
        ${isOver 
          ? 'bg-gray-100 dark:bg-gray-800/70 border-gray-400' 
          : 'bg-gray-50 dark:bg-gray-900/50 border-transparent'
        }
      `}
    >
      {children}
    </div>
  );
};

// Draggable Card
import { useDraggable } from '@dnd-kit/core';

const DraggableCard: React.FC<{ app: IJobApplication }> = ({ app }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: app._id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-3 ${isDragging ? 'opacity-50 scale-105 z-50' : ''}`}
      whileDrag={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {app.companyName}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {app.position || 'No position specified'}
              </p>
            </div>
            <Badge variant="default">
              {app.emailSent ? 'Email Sent' : 'No Email'}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{app.hrEmail}</span>
            </div>
          </div>

          {app.followUpDate && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Follow-up: {format(new Date(app.followUpDate), 'MMM dd')}</span>
            </div>
          )}

          {app.remarks && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
              {app.remarks}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};