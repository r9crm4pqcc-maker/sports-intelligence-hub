// ─── Cristian's fixed profile ─────────────────────────────────────────────────
export const PROFILE = {
  firstName: "Cristian",
  middleName: "",
  lastName: "Zavala",
  fullName: "Cristian Zavala",
  birthMonth: 9,
  birthDay: 8,
  birthYear: 2009,
  birthDateStr: "9/8/2009",
  birthTime: "11:18",
  birthCity: "Chicago",
  birthState: "Illinois",
  birthCountry: "USA",
  position: "Winger",
  teamName: "North Grand",
  teamMascot: "Eagle Owl",
} as const;

export type Profile = typeof PROFILE;
