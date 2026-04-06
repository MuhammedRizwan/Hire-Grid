// hooks/useApplications.ts
import { useState, useCallback, useEffect } from 'react';
import { IJobApplication } from '@/types';

interface UseApplicationsReturn {
  applications: IJobApplication[];
  stats: {
    total: number;
    applied: number;
    followUp: number;
    interview: number;
    rejected: number;
    offer: number;
  };
  loading: boolean;
  fetchApplications: (page?: number, status?: string, search?: string) => Promise<void>;
  createApplication: (data: FormData) => Promise<any>;
  updateApplication: (id: string, data: any) => Promise<any>;
  deleteApplication: (id: string) => Promise<void>;
}

export const useApplications = (token: string | null): UseApplicationsReturn => {
  const [applications, setApplications] = useState<IJobApplication[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    followUp: 0,
    interview: 0,
    rejected: 0,
    offer: 0,
  });
  const [loading, setLoading] = useState(false);
  
  const fetchApplications = useCallback(async (page = 1, status = 'all', search = '') => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(status !== 'all' && { status }),
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  const fetchStats = useCallback(async () => {
    if (!token) return;
    console.log(token,"----------------")
    try {
      const response = await fetch('/api/applications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [token]);
  
  const createApplication = async (data: FormData) => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });
      
      if (response.ok) {
        const application = await response.json();
        await fetchApplications();
        await fetchStats();
        return application;
      }
      
      throw new Error('Failed to create application');
    } catch (error) {
      console.error('Create application error:', error);
      throw error;
    }
  };
  
  const updateApplication = async (id: string, data: any) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const application = await response.json();
        await fetchApplications();
        await fetchStats();
        return application;
      }
      
      throw new Error('Failed to update application');
    } catch (error) {
      console.error('Update application error:', error);
      throw error;
    }
  };
  
  const deleteApplication = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        await fetchApplications();
        await fetchStats();
      } else {
        throw new Error('Failed to delete application');
      }
    } catch (error) {
      console.error('Delete application error:', error);
      throw error;
    }
  };
  
  // Fetch stats when token changes
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);
  
  return {
    applications,
    stats,
    loading,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
  };
};