'use client';

import React, { useEffect, useState } from 'react';
import { ImageGenerationTask } from './types';

const MyCreationsPage: React.FC = () => {
  const [tasks, setTasks] = useState<ImageGenerationTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generation/my-tasks');
      const data = await response.json();

      if (response.ok) {
        setTasks(data.tasks || []);
      } else {
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('An error occurred while fetching tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (taskId: string) => {
    try {
      const response = await fetch(`/api/generation/retry/${taskId}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        fetchTasks();
      } else {
        setError(data.error || 'Failed to retry task');
      }
    } catch (err) {
      setError('An error occurred while retrying task');
    }
  };

  const handleDownload = (url: string, taskId: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `pet-${taskId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 uppercase tracking-widest">
            ✓ Completed
          </span>
        );
      case 'processing':
      case 'waiting':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">
            ⏳ Generating
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase tracking-widest">
            ✗ Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center">
        <div className="animate-bounce text-4xl">🐾</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white festive-font">My Creations</h1>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            🔄 Refresh
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-32 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="text-8xl mb-8 opacity-20">📸</div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">No creations yet</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Go to homepage and create your first festive portrait!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-xl transition-all">
                <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
                  {task.generatedImageUrl ? (
                    <img
                      src={task.generatedImageUrl}
                      alt={task.style}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : task.originalImageUrl ? (
                    <img
                      src={task.originalImageUrl}
                      alt="Original"
                      className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">🖼️</span>
                    </div>
                  )}

                  <div className="absolute top-4 right-4">
                    {getStatusBadge(task.status)}
                  </div>

                  {task.status === 'waiting' || task.status === 'processing' ? (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin text-4xl mb-2">🎄</div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Generating...</p>
                      </div>
                    </div>
                  ) : task.status === 'failed' && task.errorMessage && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-50/90 dark:bg-red-900/90 backdrop-blur-sm p-2">
                      <p className="text-[10px] text-red-600 dark:text-red-400 truncate">{task.errorMessage}</p>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {task.style}
                    </span>
                  </div>

                  {task.status === 'completed' && task.generatedImageUrl && (
                    <button
                      onClick={() => handleDownload(task.generatedImageUrl!, task.id)}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      Download
                    </button>
                  )}

                  {task.status === 'failed' && task.retryCount < 3 && (
                    <button
                      onClick={() => handleRetry(task.id)}
                      className="w-full bg-red-600 dark:bg-red-600 text-white py-3 rounded-2xl font-bold hover:bg-red-700 dark:hover:bg-red-500 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      Retry ({task.retryCount}/3)
                    </button>
                  )}

                  {task.status === 'failed' && task.retryCount >= 3 && (
                    <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-3 rounded-2xl font-medium text-center text-sm">
                      Max retries reached
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCreationsPage;
