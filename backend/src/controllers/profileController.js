import Profile from "../models/Profile.js";

export const createProfile = async (req, res) => {
  try {
    const { name, timezone } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });
    const p = await Profile.create({ name, timezone: timezone || "UTC" });
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort("name");
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const { timezone, name } = req.body;
    const p = await Profile.findById(id);
    if (!p) return res.status(404).json({ message: "Profile not found" });
    if (timezone) p.timezone = timezone;
    if (name) p.name = name;
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
