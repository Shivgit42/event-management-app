import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import ProfileDropdown from '../components/ProfileDropdown';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';

export default function EventManager(){
  const { fetchProfiles } = useStore(state => ({ fetchProfiles: state.fetchProfiles }));
  useEffect(()=>{ fetchProfiles(); },[]);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <ProfileDropdown />
      </div>
      <div className="board">
        <div className="left-column card">
          <EventForm />
        </div>
        <div className="right-column card">
          <EventList />
        </div>
      </div>
    </div>
  );
}
