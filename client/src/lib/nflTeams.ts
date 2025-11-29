export const TEAMS = {
  "Atlanta Falcons": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/atlanta-falcons-logo.png",
  "Tampa Bay Buccaneers": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/tampa-bay-buccaneers-logo.png",
  "Jacksonville Jaguars": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/jacksonville-jaguars-logo.png",
  "Los Angeles Rams": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/los-angeles-rams-logo.png",
  "Baltimore Ravens": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/baltimore-ravens-logo.png",
  "Miami Dolphins": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/miami-dolphins-logo.png",
  "Chicago Bears": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/chicago-bears-logo.png",
  "Houston Texans": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/houston-texans-logo.png",
  "New Orleans Saints": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/new-orleans-saints-logo.png",
  "San Francisco 49ers": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/san-francisco-49ers-logo.png",
  "Kansas City Chiefs": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/kansas-city-chiefs-logo.png",
  "Detroit Lions": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/detroit-lions-logo.png",
  "Philadelphia Eagles": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/philadelphia-eagles-logo.png",
  "Arizona Cardinals": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/arizona-cardinals-logo.png",
  "Dallas Cowboys": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/dallas-cowboys-logo.png",
  "Buffalo Bills": "https://raw.githubusercontent.com/datasets/nfl-teams/master/data/buffalo-bills-logo.png",
};

export function getTeamLogo(teamName: string): string | undefined {
  return TEAMS[teamName as keyof typeof TEAMS];
}
