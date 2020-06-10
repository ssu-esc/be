export function getTrackNumber(track?: string): number {
  if (!track) return 0;
  if (/^\d+$/.test(track)) return parseInt(track, 10);
  if (/^\d+\/\d+$/.test(track)) return parseInt(track.split('/')[0], 10);
  return 0;
}

export default { getTrackNumber };
