import type { Game, Standings } from "@shared/schema";

/**
 * Calculate win probability for a team based on:
 * - Point Differential (standing indicator)
 * - Current score (during live games)
 * - Quarter progress (game momentum)
 */
export function calculateWinProbability(
  game: Game,
  team: "team1" | "team2",
  standings?: Standings[]
) {
  const standings1 = standings?.find(s => s.team === game.team1);
  const standings2 = standings?.find(s => s.team === game.team2);
  
  const team1PD = standings1?.pointDifferential || 0;
  const team2PD = standings2?.pointDifferential || 0;
  
  // Base probability from PD difference
  const pdDifference = team1PD - team2PD;
  let probability = 50 + (pdDifference / 20); // Each 20 points PD = 10% swing
  
  // Factor in score if game has started (quarter is not "Scheduled")
  if (game.quarter && game.quarter !== "Scheduled") {
    const scoreDifference = game.team1Score! - game.team2Score!;
    
    // Quarter weight multiplier - increases with game progress
    const quarterMap: { [key: string]: number } = {
      "1st": 0.3,
      "2nd": 0.5,
      "3rd": 0.75,
      "4th": 1.0,
      "Q1": 0.3,
      "Q2": 0.5,
      "Q3": 0.75,
      "Q4": 1.0,
    };
    
    const quarterWeight = quarterMap[game.quarter] || 0.5;
    
    // Score impact is more realistic: every 7 points = ~10% swing in later quarters
    const scoreImpact = (scoreDifference / 7) * 10 * quarterWeight;
    probability += scoreImpact;
  }
  
  // Cap between 1% and 99% (allow extreme differentials to show)
  probability = Math.max(1, Math.min(99, Math.round(probability)));
  
  // Return probability for the requested team
  if (team === "team1") {
    return probability;
  } else {
    return 100 - probability;
  }
}
