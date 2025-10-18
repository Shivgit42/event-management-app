import Event from "../models/Event.js";
import EventLog from "../models/EventLog.js";
import Profile from "../models/Profile.js";
import timeUtil from "../utils/time.js";

export const createEvent = async (req, res) => {
  try {
    const { profiles, eventTimezone, startLocal, endLocal, title } = req.body;
    if (!profiles || !profiles.length)
      return res.status(400).json({ message: "Profiles required" });
    if (!eventTimezone)
      return res.status(400).json({ message: "eventTimezone required" });
    if (!startLocal || !endLocal)
      return res
        .status(400)
        .json({ message: "startLocal and endLocal required" });

    const startUTC = timeUtil.localToUTC(startLocal, eventTimezone);
    const endUTC = timeUtil.localToUTC(endLocal, eventTimezone);

    if (endUTC <= startUTC)
      return res
        .status(400)
        .json({ message: "Can't pick a date that has passed" });

    const ev = await Event.create({
      title: title || "Event",
      profiles,
      eventTimezone,
      startUTC,
      endUTC,
      createdAtUTC: new Date(),
      updatedAtUTC: new Date(),
    });

    await EventLog.create({
      event: ev._id,
      changedByProfile: null,
      timestampUTC: new Date(),
      diff: {
        previous: null,
        current: { startUTC, endUTC, eventTimezone, profiles, title },
      },
    });

    res.status(201).json(ev);
  } catch (err) {
    console.error("createEvent err", err);
    res.status(500).json({ message: err.message });
  }
};

export const listEventsForProfile = async (req, res) => {
  try {
    const profileId = req.params.profileId;
    const profile = await Profile.findById(profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const events = await Event.find({ profiles: profileId }).populate(
      "profiles",
      "name timezone"
    );

    const viewTz = req.query.tz || profile.timezone;

    const converted = events.map((ev) => ({
      _id: ev._id,
      title: ev.title,
      profiles: ev.profiles,
      eventTimezone: ev.eventTimezone,
      start: timeUtil.utcToTz(ev.startUTC, viewTz),
      end: timeUtil.utcToTz(ev.endUTC, viewTz),
      createdAt: timeUtil.utcToTz(ev.createdAtUTC, viewTz),
      updatedAt: timeUtil.utcToTz(ev.updatedAtUTC, viewTz),
    }));

    res.json({
      profile: {
        _id: profile._id,
        name: profile.name,
        timezone: profile.timezone,
      },
      events: converted,
    });
  } catch (err) {
    console.error("listEventsForProfile err", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { startLocal, endLocal, eventTimezone, profiles, title, changedBy } =
      req.body;

    const ev = await Event.findById(eventId);
    if (!ev) return res.status(404).json({ message: "Event not found" });

    const prev = {
      startUTC: ev.startUTC,
      endUTC: ev.endUTC,
      eventTimezone: ev.eventTimezone,
      profiles: ev.profiles,
      title: ev.title,
    };

    if (eventTimezone) ev.eventTimezone = eventTimezone;
    if (startLocal)
      ev.startUTC = timeUtil.localToUTC(startLocal, ev.eventTimezone);
    if (endLocal) ev.endUTC = timeUtil.localToUTC(endLocal, ev.eventTimezone);
    if (profiles) ev.profiles = profiles;
    if (title) ev.title = title;

    if (ev.endUTC <= ev.startUTC)
      return res
        .status(400)
        .json({ message: "Can't pick a date that has passed" });

    ev.updatedAtUTC = new Date();
    await ev.save();

    await EventLog.create({
      event: ev._id,
      changedByProfile: changedBy || null,
      timestampUTC: new Date(),
      diff: {
        previous: prev,
        current: {
          startUTC: ev.startUTC,
          endUTC: ev.endUTC,
          eventTimezone: ev.eventTimezone,
          profiles: ev.profiles,
          title: ev.title,
        },
      },
    });

    res.json(ev);
  } catch (err) {
    console.error("updateEvent err", err);
    res.status(500).json({ message: err.message });
  }
};

export const getEventLogs = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const tz = req.query.tz || "UTC";

    const logs = await EventLog.find({ event: eventId }).populate(
      "changedByProfile",
      "name"
    );

    const converted = logs.map((l) => ({
      _id: l._id,
      changedBy: l.changedByProfile,
      timestamp: timeUtil.utcToTz(l.timestampUTC, tz),
      diff: (() => {
        const prev = l.diff.previous || {};
        const curr = l.diff.current || {};
        const conv = { previous: {}, current: {} };
        if (prev.startUTC)
          conv.previous.start = timeUtil.utcToTz(prev.startUTC, tz);
        if (prev.endUTC) conv.previous.end = timeUtil.utcToTz(prev.endUTC, tz);
        if (curr.startUTC)
          conv.current.start = timeUtil.utcToTz(curr.startUTC, tz);
        if (curr.endUTC) conv.current.end = timeUtil.utcToTz(curr.endUTC, tz);
        conv.previous.title = prev.title;
        conv.current.title = curr.title;
        conv.previous.eventTimezone = prev.eventTimezone;
        conv.current.eventTimezone = curr.eventTimezone;
        conv.previous.profiles = prev.profiles;
        conv.current.profiles = curr.profiles;
        return conv;
      })(),
    }));

    res.json(converted);
  } catch (err) {
    console.error("getEventLogs err", err);
    res.status(500).json({ message: err.message });
  }
};
