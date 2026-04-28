// components/operations/TeamTable/TeamTable.js
'use client';

import { useState } from 'react';
import Table from '@/app/components/ui/Table/Table';
import SearchBar from '@/app/components/ui/SearchBar/SearchBar';

export default function TeamTable({ 
  teams = [], 
  loading = false, 
  onRowClick,
  onAssign 
}) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const types = [...new Set(teams.map(t => t.type).filter(Boolean))];
  const statuses = ['active', 'inactive'];
  
  const filteredTeams = teams.filter(team => {
    const matchesSearch = !search || 
      team.name?.toLowerCase().includes(search.toLowerCase()) ||
      team.teamLead?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !typeFilter || team.type === typeFilter;
    const matchesStatus = !statusFilter || team.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const getTeamIcon = (type) => {
    const icons = {
      'crew': '👥',
      'maintenance': '🔧',
      'installation': '🏗️',
      'repair': '🛠️',
      'inspection': '🔍',
      'safety': '🛡️'
    };
    return icons[type?.toLowerCase()] || '👥';
  };
  
  const columns = [
    { header: 'Team', accessor: 'name', width: '25%' },
    { header: 'Type', accessor: 'type', width: '12%' },
    { header: 'Team Lead', accessor: 'teamLead', width: '15%' },
    { header: 'Members', accessor: 'memberCount', width: '10%', align: 'center' },
    { header: 'Status', accessor: 'status', width: '10%', align: 'center' },
    { header: 'Current Jobs', accessor: 'activeJobs', width: '12%', align: 'center' },
    { header: 'Actions', accessor: 'actions', width: '16%', align: 'center' }
  ];
  
  const processedData = filteredTeams.map(team => ({
    ...team,
    name: `${getTeamIcon(team.type)} ${team.name}`,
    memberCount: `${team.members?.length || 0} members`,
    status: (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.25rem',
        padding: '0.25rem 0.5rem', 
        borderRadius: '9999px', 
        background: team.status === 'active' ? '#d1fae5' : '#f3f4f6',
        color: team.status === 'active' ? '#065f46' : '#374151',
        fontSize: '0.75rem',
        fontWeight: 500
      }}>
        {team.status === 'active' ? '🟢 Active' : '⚪ Inactive'}
      </span>
    ),
    activeJobs: team.currentAssignments?.length || 0,
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        {onAssign && (
          <button 
            onClick={(e) => { e.stopPropagation(); onAssign(team); }}
            style={{ padding: '0.25rem 0.5rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Assign Members
          </button>
        )}
      </div>
    )
  }));
  
  return (
    <div className="team-table">
      <div className="table-toolbar">
        <SearchBar 
          onSearch={(query) => setSearch(query.query || '')}
          placeholder="Search by team name or team lead..."
        />
        
        <div className="filters">
          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <Table 
        columns={columns} 
        data={processedData} 
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage="No teams found"
      />
      
      <style jsx>{`
        .team-table {
          background: white;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .table-toolbar {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .filters {
          display: flex;
          gap: 0.5rem;
        }
        
        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }
        
        @media (max-width: 768px) {
          .table-toolbar {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}