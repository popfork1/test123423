export const TEAMS = {
  "Atlanta Falcons": "https://upload.wikimedia.org/wikipedia/en/c/c5/Atlanta_Falcons_logo.svg",
  "Tampa Bay Buccaneers": "https://upload.wikimedia.org/wikipedia/en/a/a2/Tampa_Bay_Buccaneers_logo.svg",
  "Jacksonville Jaguars": "https://upload.wikimedia.org/wikipedia/en/7/7a/Jacksonville_Jaguars_logo.svg",
  "Los Angeles Rams": "https://upload.wikimedia.org/wikipedia/en/8/8f/Los_Angeles_Rams_logo.svg",
  "Baltimore Ravens": "https://upload.wikimedia.org/wikipedia/en/1/16/Baltimore_Ravens_logo.svg",
  "Miami Dolphins": "https://upload.wikimedia.org/wikipedia/en/3/39/Miami_Dolphins_logo.svg",
  "Chicago Bears": "https://upload.wikimedia.org/wikipedia/en/5/5c/Chicago_Bears_logo.svg",
  "Houston Texans": "https://upload.wikimedia.org/wikipedia/en/2/28/Houston_Texans_logo.svg",
  "New Orleans Saints": "https://upload.wikimedia.org/wikipedia/en/5/50/New_Orleans_Saints_logo.svg",
  "San Francisco 49ers": "https://upload.wikimedia.org/wikipedia/en/3/3a/San_Francisco_49ers_logo.svg",
  "Kansas City Chiefs": "https://upload.wikimedia.org/wikipedia/en/e/e1/Kansas_City_Chiefs_logo.svg",
  "Detroit Lions": "https://upload.wikimedia.org/wikipedia/en/7/71/Detroit_Lions_logo.svg",
  "Philadelphia Eagles": "https://upload.wikimedia.org/wikipedia/en/8/8e/Philadelphia_Eagles_logo.svg",
  "Arizona Cardinals": "https://upload.wikimedia.org/wikipedia/en/3/3c/Arizona_Cardinals_logo.svg",
  "Dallas Cowboys": "https://upload.wikimedia.org/wikipedia/en/1/15/Dallas_Cowboys.svg",
  "Buffalo Bills": "https://upload.wikimedia.org/wikipedia/en/8/8c/Buffalo_Bills_logo.svg",
};

export function getTeamLogo(teamName: string): string | undefined {
  return TEAMS[teamName as keyof typeof TEAMS];
}
