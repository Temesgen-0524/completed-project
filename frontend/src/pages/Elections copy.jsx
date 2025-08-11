import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Vote, 
  Trophy, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Elections = () => {
  const { user, token } = useAuth();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [candidateFormData, setCandidateFormData] = useState({
    name: '',
    position: '',
    department: '',
    year: '',
    studentId: '',
    profileImage: '',
    platform: [''],
    bio: ''
  });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    eligibleVoters: 0
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/elections');
      if (response.ok) {
        const data = await response.json();
        setElections(data);
      }
    } catch (error) {
      setError('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  const createElection = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newElection)
      });

      if (response.ok) {
        setSuccess('Election created successfully!');
        setShowCreateForm(false);
        setNewElection({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          eligibleVoters: 0
        });
        fetchElections();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create election');
      }
    } catch (error) {
      setError('Failed to create election');
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/elections/${selectedElection._id}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(candidateFormData)
      });

      if (response.ok) {
        setSuccess('Candidate added successfully!');
        setShowCandidateForm(false);
        setCandidateFormData({
          name: '',
          position: '',
          department: '',
          year: '',
          studentId: '',
          profileImage: '',
          platform: [''],
          bio: ''
        });
        fetchElections();
        // Refresh selected election data
        const updatedElection = elections.find(e => e._id === selectedElection._id);
        if (updatedElection) {
          setSelectedElection(updatedElection);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add candidate');
      }
    } catch (error) {
      setError('Failed to add candidate');
    }
  };

  const addMultipleCandidates = async () => {
    if (candidates.length === 0) {
      setError('Please add at least one candidate');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/elections/${selectedElection._id}/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(candidates)
      });

      if (response.ok) {
        setSuccess(`${candidates.length} candidates added successfully!`);
        setCandidates([]);
        fetchElections();
        // Refresh selected election data
        const updatedElection = elections.find(e => e._id === selectedElection._id);
        if (updatedElection) {
          setSelectedElection(updatedElection);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add candidates');
      }
    } catch (error) {
      setError('Failed to add candidates');
    }
  };

  const removeCandidate = async (candidateId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/elections/${selectedElection._id}/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Candidate removed successfully!');
        fetchElections();
        // Refresh selected election data
        const updatedElection = elections.find(e => e._id === selectedElection._id);
        if (updatedElection) {
          setSelectedElection(updatedElection);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to remove candidate');
      }
    } catch (error) {
      setError('Failed to remove candidate');
    }
  };

  const updateElectionStatus = async (electionId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/elections/${electionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setSuccess(`Election status updated to ${status}!`);
        fetchElections();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update election status');
      }
    } catch (error) {
      setError('Failed to update election status');
    }
  };

  const vote = async (electionId, candidateIds) => {
    try {
      const response = await fetch(`http://localhost:5000/api/elections/${electionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ candidateIds })
      });

      if (response.ok) {
        setSuccess('Vote cast successfully!');
        fetchElections();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to cast vote');
      }
    } catch (error) {
      setError('Failed to cast vote');
    }
  };

  const addCandidateToList = () => {
    if (!candidateFormData.name || !candidateFormData.position || !candidateFormData.studentId) {
      setError('Please fill in required fields (Name, Position, Student ID)');
      return;
    }

    setCandidates([...candidates, { ...candidateFormData }]);
    setCandidateFormData({
      name: '',
      position: '',
      department: '',
      year: '',
      studentId: '',
      profileImage: '',
      platform: [''],
      bio: ''
    });
    setError('');
  };

  const removeCandidateFromList = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handlePlatformChange = (index, value) => {
    const newPlatform = [...candidateFormData.platform];
    newPlatform[index] = value;
    setCandidateFormData({ ...candidateFormData, platform: newPlatform });
  };

  const addPlatformPoint = () => {
    setCandidateFormData({
      ...candidateFormData,
      platform: [...candidateFormData.platform, '']
    });
  };

  const removePlatformPoint = (index) => {
    const newPlatform = candidateFormData.platform.filter((_, i) => i !== index);
    setCandidateFormData({ ...candidateFormData, platform: newPlatform });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ongoing': return 'text-green-600 bg-green-100';
      case 'Completed': return 'text-blue-600 bg-blue-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Elections</h1>
          <p className="text-gray-600">Participate in democratic processes and make your voice heard</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
          >
            {success}
            <button onClick={() => setSuccess('')} className="float-right font-bold">×</button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          >
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </motion.div>
        )}

        {/* Admin Controls */}
        {user?.role === 'admin' && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Election
              </button>
            </div>
          </div>
        )}

        {/* Elections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {elections.map((election) => (
            <motion.div
              key={election._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{election.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                    {election.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{election.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{election.candidates?.length || 0} Candidates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Vote className="w-4 h-4" />
                    <span>{election.totalVotes} Total Votes</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedElection(election)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View Details
                  </button>
                  
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedElection(election);
                          setShowCandidateForm(true);
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        Add Candidates
                      </button>
                      
                      {election.status === 'Pending' && (
                        <button
                          onClick={() => updateElectionStatus(election._id, 'Ongoing')}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Start
                        </button>
                      )}
                      
                      {election.status === 'Ongoing' && (
                        <button
                          onClick={() => updateElectionStatus(election._id, 'Completed')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          End
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Election Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create New Election</h2>
              <form onSubmit={createElection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newElection.title}
                    onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newElection.description}
                    onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    value={newElection.startDate}
                    onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    value={newElection.endDate}
                    onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Voters</label>
                  <input
                    type="number"
                    value={newElection.eligibleVoters}
                    onChange={(e) => setNewElection({ ...newElection, eligibleVoters: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Create Election
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Candidates Modal */}
        {showCandidateForm && selectedElection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
              <h2 className="text-xl font-semibold mb-4">Add Candidates to {selectedElection.title}</h2>
              
              {/* Candidate Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-4">Add New Candidate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={candidateFormData.name}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                    <input
                      type="text"
                      value={candidateFormData.position}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={candidateFormData.department}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                      value={candidateFormData.year}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                    <input
                      type="text"
                      value={candidateFormData.studentId}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, studentId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                    <input
                      type="url"
                      value={candidateFormData.profileImage}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, profileImage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Points</label>
                  {candidateFormData.platform.map((point, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handlePlatformChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Platform point ${index + 1}`}
                      />
                      {candidateFormData.platform.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlatformPoint(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPlatformPoint}
                    className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Platform Point
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={candidateFormData.bio}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Brief biography of the candidate"
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={addCandidateToList}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to List
                  </button>
                </div>
              </div>

              {/* Candidates List */}
              {candidates.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Candidates to Add ({candidates.length})</h3>
                  <div className="space-y-3">
                    {candidates.map((candidate, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{candidate.name}</h4>
                          <p className="text-sm text-gray-600">{candidate.position} - {candidate.studentId}</p>
                          <p className="text-sm text-gray-500">{candidate.department} - {candidate.year}</p>
                        </div>
                        <button
                          onClick={() => removeCandidateFromList(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {candidates.length > 0 && (
                  <button
                    onClick={addMultipleCandidates}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Add All Candidates ({candidates.length})
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowCandidateForm(false);
                    setCandidates([]);
                    setCandidateFormData({
                      name: '',
                      position: '',
                      department: '',
                      year: '',
                      studentId: '',
                      profileImage: '',
                      platform: [''],
                      bio: ''
                    });
                  }}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Election Details Modal */}
        {selectedElection && !showCandidateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedElection.title}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(selectedElection.status)}`}>
                    {selectedElection.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedElection(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">{selectedElection.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Election Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Start: {new Date(selectedElection.startDate).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>End: {new Date(selectedElection.endDate).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Eligible Voters: {selectedElection.eligibleVoters}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Vote className="w-4 h-4" />
                      <span>Total Votes: {selectedElection.totalVotes}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div>Candidates: {selectedElection.candidates?.length || 0}</div>
                    <div>Voters: {selectedElection.voters?.length || 0}</div>
                    <div>Turnout: {selectedElection.eligibleVoters > 0 ? 
                      ((selectedElection.voters?.length || 0) / selectedElection.eligibleVoters * 100).toFixed(1) : 0}%</div>
                  </div>
                </div>
              </div>

              {/* Candidates */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Candidates</h3>
                  {user?.role === 'admin' && selectedElection.status === 'Pending' && (
                    <button
                      onClick={() => setShowCandidateForm(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Candidates
                    </button>
                  )}
                </div>

                {selectedElection.candidates && selectedElection.candidates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedElection.candidates.map((candidate) => (
                      <div key={candidate._id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {candidate.profileImage && (
                            <img
                              src={candidate.profileImage}
                              alt={candidate.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{candidate.name}</h4>
                            <p className="text-blue-600 font-medium">{candidate.position}</p>
                            <p className="text-sm text-gray-600">{candidate.department} - {candidate.year}</p>
                            <p className="text-sm text-gray-500">ID: {candidate.studentId}</p>
                            
                            {candidate.platform && candidate.platform.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Platform:</p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {candidate.platform.map((point, index) => (
                                    <li key={index}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {candidate.bio && (
                              <p className="text-sm text-gray-600 mt-2">{candidate.bio}</p>
                            )}
                            
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="font-medium">{candidate.votes} votes</span>
                              </div>
                              
                              {user?.role === 'admin' && selectedElection.status === 'Pending' && (
                                <button
                                  onClick={() => removeCandidate(candidate._id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No candidates added yet</p>
                  </div>
                )}
              </div>

              {/* Voting Section */}
              {selectedElection.status === 'Ongoing' && user?.role === 'student' && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Cast Your Vote</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the candidate(s) you want to vote for and click "Vote"
                  </p>
                  {/* Voting interface would go here */}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;