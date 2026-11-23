/** Move a game clock offset across local midnight without changing its timezone. */
export function localHourDate(game: readonly number[], hour: number): { date: [number, number, number]; hour: number } {
  const clock=new Date(Date.UTC(game[0],game[1]-1,game[2],hour));
  return {date:[clock.getUTCFullYear(),clock.getUTCMonth()+1,clock.getUTCDate()],hour:clock.getUTCHours()};
}
