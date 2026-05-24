'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Fleet {
  id: string;
  name: string;
  status: string;
  totalPower: number;
  formations: FleetFormation[];
}

interface FleetFormation {
  id: string;
  quantity: number;
  ship: {
    blueprint: {
      name: string;
      type: string;
    };
  };
}

interface Ship {
  id: string;
  quantity: number;
  blueprint: {
    name: string;
    type: string;
    attack: number;
    hp: number;
    defense: number;
    speed: number;
  };
}

export default function FleetsPage() {
  const router = useRouter();
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [newFleetName, setNewFleetName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [fleetsRes, empireRes] = await Promise.all([
        axios.get('/api/fleets', { headers }),
        axios.get('/api/empire', { headers }),
      ]);

      setFleets(fleetsRes.data.fleets || []);
      setShips(empireRes.data.ships || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load fleets');
      setLoading(false);
    }
  };

  const createFleet = async () => {
    if (!newFleetName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post('/api/fleets', { name: newFleetName }, { headers });
      setNewFleetName('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create fleet');
    }
  };

  const disbandFleet = async (fleetId: string) => {
    if (!confirm('Disband this fleet? Ships will return to inventory.')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(`/api/fleets/${fleetId}`, { headers });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to disband fleet');
    }
  };

  const assignShips = async (fleetId: string, shipId: string, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`/api/fleets/${fleetId}/assign-ships`, { shipId, quantity }, { headers });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign ships');
    }
  };

  const removeShips = async (fleetId: string, shipId: string, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`/api/fleets/${fleetId}/remove-ships`, { shipId, quantity }, { headers });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove ships');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDLE': return 'text-green-400';
      case 'ON_MISSION': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Fleets</h1>
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

        {/* Create Fleet */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Create New Fleet</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFleetName}
              onChange={(e) => setNewFleetName(e.target.value)}
              placeholder="Fleet name..."
              className="flex-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
            />
            <button
              onClick={createFleet}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              Create Fleet
            </button>
          </div>
        </div>

        {/* Available Ships */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Available Ships</h2>
          {ships.length === 0 ? (
            <p className="text-gray-400">No ships in inventory. Build ships in the Shipyard first.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ships.map((ship) => (
                <div key={ship.id} className="p-3 bg-gray-700 rounded">
                  <div className="font-medium">{ship.blueprint.name}</div>
                  <div className="text-sm text-gray-400">Qty: {ship.quantity}</div>
                  <div className="text-xs text-gray-500">
                    ATK:{ship.blueprint.attack} HP:{ship.blueprint.hp} DEF:{ship.blueprint.defense} SPD:{ship.blueprint.speed}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fleets */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Fleets</h2>
          {fleets.length === 0 ? (
            <p className="text-gray-400">No fleets created yet.</p>
          ) : (
            fleets.map((fleet) => (
              <div key={fleet.id} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium">{fleet.name}</h3>
                    <div className="flex gap-4 text-sm mt-1">
                      <span className={getStatusColor(fleet.status)}>
                        Status: {fleet.status}
                      </span>
                      <span className="text-gray-400">
                        Power: {fleet.totalPower}
                      </span>
                    </div>
                  </div>
                  {fleet.status === 'IDLE' && (
                    <button
                      onClick={() => disbandFleet(fleet.id)}
                      className="px-3 py-1 text-sm bg-red-700 rounded hover:bg-red-600"
                    >
                      Disband
                    </button>
                  )}
                </div>

                {/* Fleet Ships */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Assigned Ships:</h4>
                  {fleet.formations.length === 0 ? (
                    <p className="text-sm text-gray-500">No ships assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {fleet.formations.map((formation) => (
                        <div key={formation.id} className="px-2 py-1 bg-gray-700 rounded text-sm">
                          {formation.ship.blueprint.name} x{formation.quantity}
                          {fleet.status === 'IDLE' && (
                            <button
                              onClick={() => removeShips(fleet.id, formation.ship.id, formation.quantity)}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assign Ships */}
                {fleet.status === 'IDLE' && (
                  <div className="mt-3 p-2 bg-gray-700/50 rounded">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Add Ships:</h4>
                    <div className="flex flex-wrap gap-2">
                      {ships
                        .filter((s) => s.quantity > 0)
                        .map((ship) => (
                          <button
                            key={ship.id}
                            onClick={() => assignShips(fleet.id, ship.id, 1)}
                            className="px-2 py-1 text-sm bg-blue-700 rounded hover:bg-blue-600"
                          >
                            +{ship.blueprint.name} ({ship.quantity})
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
