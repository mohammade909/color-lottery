'use client'
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { LiveData } from '../types';
import { useSocket } from '../hooks/useSocket';

export default function LiveDataDisplay() {
  const socket = useSocket();
  const [liveData, setLiveData] = useState<LiveData[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleLiveData = (data: LiveData) => {
      setLiveData((prev) => [...prev.slice(-19), { ...data, timestamp: new Date(data.timestamp) }]);
    };

    socket.on('live_data_update', handleLiveData);

    return () => {
      socket.off('live_data_update', handleLiveData);
    };
  }, [socket]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Live Data</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {liveData.length > 0 ? (
              liveData.map((data, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(data.timestamp), 'HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.value.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        data.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {data.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  Waiting for data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}