export interface RecordStats { record?: string; streak?: string; h2h?: string; home?: string; away?: string }
export interface RecordVibration { label: string; value: number; root: number }
export function vibrationRoot(n: number): number {
  let value=Math.abs(n);
  const start=value;
  while(value>9 && ![11,22,33].includes(value)) value=[...String(value)].reduce((sum,d)=>sum+Number(d),0);
  return value===2 && start!==2 ? 11 : value;
}
export function parseSportsRecord(record?: string) {
  const m=record?.match(/^\s*(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?/);
  return m ? {wins:+m[1],losses:+m[2],extra:m[3] ? +m[3] : undefined} : null;
}
export function recordVibrations(stats: RecordStats): RecordVibration[] {
  const rows:RecordVibration[]=[];
  const add=(label:string,value:number)=>rows.push({label,value,root:vibrationRoot(value)});
  for(const [label,text] of [["Season",stats.record],["Season H2H",stats.h2h],["Home",stats.home],["Away",stats.away]] as const) {
    const record=parseSportsRecord(text);
    if(!record)continue;
    add(`${label} wins`,record.wins);add(`${label} losses`,record.losses);
    if(record.extra!==undefined)add(`${label} ties / overtime losses`,record.extra);
    add(`${label} games played`,record.wins+record.losses+(record.extra || 0));
    add(`${label} record ${record.wins}-${record.losses}`,Number(`${record.wins}${record.losses}`));
  }
  const streak=stats.streak?.match(/(?:^|\b)([WL])\s*(\d+)|(\d+)\s*(wins?|loss(?:es)?)/i);
  if(streak)add(/L|loss/i.test(streak[0]) ? "Losing streak" : "Winning streak",Number(streak[2] || streak[3]));
  return rows;
}
export interface DateCalculation { label: string; value: number }
export function gematriaDateCalculations(year:number,month:number,day:number):DateCalculation[] {
  const sum=(n:number)=>[...String(n)].reduce((s,d)=>s+Number(d),0);
  const product=(text:string)=>[...text].filter(d=>d!=="0").reduce((p,d)=>p*Number(d),1);
  const century=Math.floor(year/100),shortYear=year%100;
  const doy=Math.round((Date.UTC(year,month-1,day)-Date.UTC(year,0,0))/86400000);
  const daysInYear=Math.round((Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000);
  return [
    {label:"Month + day + century + two-digit year",value:month+day+century+shortYear},
    {label:"Month + day + year digits",value:month+day+sum(year)},
    {label:"Month digits + day digits + year digits",value:sum(month)+sum(day)+sum(year)},
    {label:"Month + day + two-digit year",value:month+day+shortYear},
    {label:"Month digits + day digits + short-year digits",value:sum(month)+sum(day)+sum(shortYear)},
    {label:"Day of year",value:doy},{label:"Days left in year",value:daysInYear-doy},
    {label:"Month + day",value:month+day},
    {label:"Month digits + day digits + century + short year",value:sum(month)+sum(day)+century+shortYear},
    {label:"Month + day + short-year digits",value:month+day+sum(shortYear)},
    {label:"Month digits + day digits + short year",value:sum(month)+sum(day)+shortYear},
    {label:"Product of non-zero full-date digits",value:product(`${month}${day}${year}`)},
    {label:"Product of non-zero short-date digits",value:product(`${month}${day}${shortYear}`)},
  ];
}
