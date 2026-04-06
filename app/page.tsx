// app/page.tsx (Dashboard)
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Download, LayoutGrid, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCards } from '../components/dashboard/stats_card';
import { ApplicationTable } from '../components/application/application_table';
import { ApplicationForm } from '../components/application/application_form';
import { KanbanBoard } from '../components/application/kanban_board';
import { useAuth } from '../hooks/useAuth';
import { useApplications } from '../hooks/useApplication';
import toast from 'react-hot-toast';
import { IJobApplication } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState<IJobApplication | null>(null);

  const { applications, stats, loading, fetchApplications, createApplication, updateApplication, deleteApplication } = useApplications(token);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchApplications();
    }
  }, [user]);

  const handleCreateApplication = async (data: FormData) => {
    try {
      await createApplication(data);
      toast.success('Application created successfully');
      setShowForm(false);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to create application');
    }
  };

  const handleUpdateApplication = async (data: FormData) => {
    if (!editingApp) return;
    try {
      await updateApplication(editingApp._id, data);
      toast.success('Application updated successfully');
      setShowForm(false);
      setEditingApp(null);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to update application');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(id);
        toast.success('Application deleted successfully');
        fetchApplications();
      } catch (error) {
        toast.error('Failed to delete application');
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Job Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track and manage your job applications
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-1">
              <button
                onClick={() => setView('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
              >
                <Table className="w-4 h-4 inline mr-1" />
                Table
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
              >
                <LayoutGrid className="w-4 h-4 inline mr-1" />
                Kanban
              </button>
            </div>

            <Button
              onClick={() => setShowForm(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Application
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Applications View */}
        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : view === 'table' ? (
            <ApplicationTable
              data={applications}
              onEdit={(app) => {
                setEditingApp(app);
                setShowForm(true);
              }}
              onDelete={handleDeleteApplication}
              onSendEmail={(app) => {
                // Implement email sending
                toast.success('Email feature coming soon');
              }}
            />
          ) : (
            <KanbanBoard
              applications={applications}
              onUpdateStatus={async (id, status) => {
                await updateApplication(id, { status });
                fetchApplications();
              }}
            />
          )}
        </div>
      </div>

      {/* Application Form Modal */}
      {showForm && (
        <ApplicationForm
          application={editingApp as IJobApplication}
          onSubmit={editingApp ? handleUpdateApplication : handleCreateApplication}
          onClose={() => {
            setShowForm(false);
            setEditingApp(null);
          }}
        />
      )}
    </div>
  );
}