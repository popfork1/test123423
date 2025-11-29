export const TEAMS = {
  "Atlanta Falcons": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Atlanta_Falcons_logo.svg/320px-Atlanta_Falcons_logo.svg.png",
  "Tampa Bay Buccaneers": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Tampa_Bay_Buccaneers_logo.svg/320px-Tampa_Bay_Buccaneers_logo.svg.png",
  "Jacksonville Jaguars": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Jacksonville_Jaguars_logo.svg/320px-Jacksonville_Jaguars_logo.svg.png",
  "Los Angeles Rams": "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Los_Angeles_Rams_logo.svg/320px-Los_Angeles_Rams_logo.svg.png",
  "Baltimore Ravens": "https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Baltimore_Ravens_logo.svg/320px-Baltimore_Ravens_logo.svg.png",
  "Miami Dolphins": "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Miami_Dolphins_logo.svg/320px-Miami_Dolphins_logo.svg.png",
  "Chicago Bears": "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Chicago_Bears_logo.svg/320px-Chicago_Bears_logo.svg.png",
  "Houston Texans": "https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Texans_logo.svg/320px-Houston_Texans_logo.svg.png",
  "New Orleans Saints": "https://upload.wikimedia.org/wikipedia/en/thumb/5/50/New_Orleans_Saints_logo.svg/320px-New_Orleans_Saints_logo.svg.png",
  "San Francisco 49ers": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/San_Francisco_49ers_logo.svg/320px-San_Francisco_49ers_logo.svg.png",
  "Kansas City Chiefs": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Kansas_City_Chiefs_logo.svg/320px-Kansas_City_Chiefs_logo.svg.png",
  "Detroit Lions": "https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Detroit_Lions_logo.svg/320px-Detroit_Lions_logo.svg.png",
  "Philadelphia Eagles": "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Philadelphia_Eagles_logo.svg/320px-Philadelphia_Eagles_logo.svg.png",
  "Arizona Cardinals": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3c/Arizona_Cardinals_logo.svg/320px-Arizona_Cardinals_logo.svg.png",
  "Dallas Cowboys": "https://upload.wikimedia.org/wikipedia/en/thumb/1/15/Dallas_Cowboys.svg/320px-Dallas_Cowboys.svg.png",
  "Buffalo Bills": "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Buffalo_Bills_logo.svg/320px-Buffalo_Bills_logo.svg.png",
};

export function getTeamLogo(teamName: string): string | undefined {
  return TEAMS[teamName as keyof typeof TEAMS];
}
