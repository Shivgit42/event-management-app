import React from "react";
import useEvents from "../hooks/useEvents";
import EventCardWrapper from "./EventCardWrapper";
import * as RW from "react-window";

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function EventList() {
  const [viewTz, setViewTz] = React.useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );

  const { events, refresh, selectedProfile } = useEvents(viewTz);

  React.useEffect(() => {
    refresh();
  }, [refresh, selectedProfile, viewTz]);

  const itemSize = 140;
  const count = events ? events.length : 0;

  const listHeight = Math.min(
    600,
    Math.max(200, Math.min(count * itemSize, 600))
  );

  const List =
    RW.FixedSizeList ||
    RW.default?.FixedSizeList ||
    RW.default ||
    RW.VariableSizeList;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>Events {selectedProfile ? `- ${selectedProfile.name}` : ""}</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 13, color: "#475569" }}>
            View in Timezone
          </label>
          <select
            value={viewTz}
            onChange={(e) => setViewTz(e.target.value)}
            style={{ padding: 8, borderRadius: 8 }}
          >
            {timezones.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {(!events || events.length === 0) && (
          <div className="empty">No events found</div>
        )}

        {events && events.length > 0 && List && (
          <List
            height={listHeight}
            itemCount={events.length}
            itemSize={itemSize}
            width="100%"
            style={{ overflowX: "hidden" }}
          >
            {({ index, style }) => {
              const ev = events[index];
              return (
                <EventCardWrapper key={ev._id} eventId={ev._id} style={style} />
              );
            }}
          </List>
        )}

        {/* Fallback if List not available for some reason */}
        {events && events.length > 0 && !List && (
          <div>
            {events.map((ev) => (
              <EventCardWrapper key={ev._id} eventId={ev._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
