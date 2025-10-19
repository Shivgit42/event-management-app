import EventManager from "./pages/EventManager.jsx";

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Event Management</h1>
        <p className="subtitle">
          Create and manage events across multiple timezones
        </p>
      </header>
      <EventManager />
    </div>
  );
}
