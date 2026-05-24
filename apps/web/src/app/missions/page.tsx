'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Mission {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  durationSeconds: number;
  minShipsRequired: number;
  recommendedPower: number;
  rewardMetal: number;
  rewardPlasma: number;
  rewardCredits: number;
  rewardXp: number;
}

interface Fleet {
  id: string;
  name: string;
  status: string;
  totalPower: number;
  formations: any[];
}

interface ActiveMission {
  id: string;
  status: string;
  mission: Mission;
  fleet: Fleet;
  startedAt: string;
  endsAt: string;
  remainingSeconds: number;
  isComplete: boolean;
}

interface MissionHistory {
  id: string;
  status: string;
  result: string;
  mission: Mission;
  fleet: Fleet;
  completedAt: string;
}

export default function MissionsPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [activeMissions, setActiveMissions] = useState<ActiveMission[]>([]);
  const [history, setHistory] = useState<MissionHistory[]>([]);
  const [selectedFleet, setSelectedFleet] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      syncMissions();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [missionsRes, fleetsRes, activeRes, historyRes] = await Promise.all([
        axios.get('/api/missions', { headers }),
        axios.get('/api/fleets', { headers }),
        axios.get('/api/missions/active', { headers }),
        axios.get('/api/missions/history', { headers }),
      ]);

      setMissions(missionsRes.data.missions || []);
      setFleets(fleetsRes.data.fleets || []);
      setActiveMissions(activeRes.data.activeMissions || []);
      setHistory(historyRes.data.history || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load missions');
      setLoading(false);
    }
  };

  const syncMissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post('/api/missions/sync', {}, { headers });

      if (res.data.completed.length > 0) {
        // Reload to show completed missions
        loadData();
      }
    } catch (err) {
      // Silent fail for auto-sync
    }
  };

  const startMission = async (missionId: string) => {
    if (!selectedFleet) {
      setError('Select a fleet first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`/api/missions/${missionId}/start`, { fleetId: selectedFleet }, { headers });
      setSelectedFleet('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start mission');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 1) return 'text-green-400';
    if (difficulty <= 2) return 'text-yellow-400';
    if (difficulty <= 3) return 'text-orange-400';
    return 'text-red-400';
  };

  const idleFleets = fleets.filter((f) => f.status === 'IDLE' && f.formations.length > 0);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Missions</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded">
            {error}
          </div>
        )}

        {/* Active Missions */}
        {activeMissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Active Missions</h2>
            <div className="space-y-3">
              {activeMissions.map((mission) => (
                <div key={mission.id} className="p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{mission.mission.name}</h3>
                      <p className="text-sm text-gray-400">Fleet: {mission.fleet.name}</p>
                    </div>
                    <div className="text-right">
                      {mission.isComplete ? (
                        <span className="text-green-400 font-medium">Complete!</span>
                      ) : (
                        <span className="text-yellow-400">
                          {formatTime(mission.remainingSeconds)} remaining
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fleet Selector */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Select Fleet</h2>
          {idleFleets.length === 0 ? (
            <p className="text-gray-400">
              No idle fleets available. Create a fleet and assign ships first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {idleFleets.map((fleet) => (
                <button
                  key={fleet.id}
                  onClick={() => setSelectedFleet(fleet.id)}
                  className={`px-3 py-2 rounded ${
                    selectedFleet === fleet.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {fleet.name} ({fleet.totalPower} power)
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Available Missions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Available Missions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((mission) => (
              <div key={mission.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{mission.name}</h3>
                  <span className={getDifficultyColor(mission.difficulty)}>
                    Difficulty: {mission.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{mission.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="text-gray-400">
                    Duration: {formatTime(mission.durationSeconds)}
                  </div>
                  <div className="text-gray-400">
                    Min Ships: {mission.minShipsRequired}
                  </div>
                  <div className="text-gray-400">
                    Power: {mission.recommendedPower}
                  </div>
                </div>
                <div className="text-sm mb-3">
                  <span className="text-gray-400">Rewards:</span>
                  <span className="ml-2 text-yellow-400">
                    {mission.rewardMetal} Metal, {mission.rewardPlasma} Plasma, {mission.rewardCredits} Credits
                  </span>
                </div>
                <button
                  onClick={() => startMission(mission.id)}
                  disabled={!selectedFleet}
                  className={`w-full py-2 rounded ${
                    selectedFleet
                      ? 'bg-green-600 hover:bg-green-500'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {selectedFleet ? 'Launch Mission' : 'Select a Fleet'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mission History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Mission History</h2>
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded ${
                    entry.result === 'WIN' ? 'bg-green-900/30' : 'bg-red-900/30'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{entry.mission.name}</span>
                    <span className={entry.result === 'WIN' ? 'text-green-400' : 'text-red-400'}>
                      {entry.result}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Fleet: {entry.fleet.name} | {new Date(entry.completedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
