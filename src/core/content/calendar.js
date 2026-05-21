const WEEKLY_THEME = {
  monday: "Mandag pa garden",
  tuesday: "Tirsdags-TikTok",
  wednesday: "Onsdags-cosplay prep",
  thursday: "Torsdags-stream",
  friday: "Fredag-fanvue",
  saturday: "Lordags-livet",
  sunday: "Sondags-kos",
};

function getDayKey(date = new Date()) {
  const keys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return keys[date.getDay()];
}

function getThemeForDate(date = new Date()) {
  return WEEKLY_THEME[getDayKey(date)] || "General content";
}

module.exports = {
  WEEKLY_THEME,
  getThemeForDate,
};
