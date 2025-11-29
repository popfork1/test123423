export const TEAMS = {
  "Atlanta Falcons": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fatl_icon.svg&w=256&q=75",
  "Tampa Bay Buccaneers": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Ftb_icon.svg&w=256&q=75",
  "Jacksonville Jaguars": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fjax_icon.svg&w=256&q=75",
  "Los Angeles Rams": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Flaram_icon.svg&w=256&q=75",
  "Baltimore Ravens": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fbalt_icon.svg&w=256&q=75",
  "Miami Dolphins": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fmia_icon.svg&w=256&q=75",
  "Chicago Bears": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fchi_icon.svg&w=256&q=75",
  "Houston Texans": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fhou_icon.svg&w=256&q=75",
  "New Orleans Saints": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fno_icon.svg&w=256&q=75",
  "San Francisco 49ers": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fsf_icon.svg&w=256&q=75",
  "Kansas City Chiefs": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fkc_icon.svg&w=256&q=75",
  "Detroit Lions": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fdet_icon.svg&w=256&q=75",
  "Philadelphia Eagles": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fphi_icon.svg&w=256&q=75",
  "Arizona Cardinals": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fari_icon.svg&w=256&q=75",
  "Dallas Cowboys": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fdal_icon.svg&w=256&q=75",
  "Buffalo Bills": "https://www.nfl.com/_next/image?url=https%3A%2F%2Fstatic.nfl.com%2Fmedia%2Fteamsite-images%2Ffootball_svg-logo_team-page%2Fbuf_icon.svg&w=256&q=75",
};

export function getTeamLogo(teamName: string): string | undefined {
  return TEAMS[teamName as keyof typeof TEAMS];
}
