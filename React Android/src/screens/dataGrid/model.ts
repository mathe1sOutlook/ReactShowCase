export type RowStatus = 'Active' | 'Pending' | 'Blocked' | 'Review';

export type GridRow = {
  id: number;
  owner: string;
  email: string;
  avatarUri: string;
  team: string;
  city: string;
  score: number;
  progress: number;
  joined: string;
  revenue: number;
  website: string;
  status: RowStatus;
  region: string;
  notes: string;
};

export type VirtualRow = {
  id: number;
  owner: string;
  status: RowStatus;
  score: number;
};

export const STATUS_OPTIONS: RowStatus[] = [
  'Active',
  'Pending',
  'Blocked',
  'Review',
];
export const TEAM_OPTIONS = ['Atlas', 'Nova', 'Pulse', 'Orbit'];
export const CITY_OPTIONS = [
  'Sao Paulo',
  'Lisbon',
  'Austin',
  'Berlin',
  'Tokyo',
  'Toronto',
];
export const REGION_OPTIONS = ['LATAM', 'EMEA', 'NA', 'APAC'];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function buildRows(count: number) {
  const firstNames = ['Ava', 'Noah', 'Mia', 'Liam', 'Nina', 'Ezra', 'Iris', 'Owen'];
  const lastNames = ['Stone', 'Parker', 'Reed', 'Lopez', 'Shaw', 'Diaz', 'King', 'Frost'];

  return Array.from({length: count}, (_, index) => {
    const id = index + 1;
    const owner = `${firstNames[index % firstNames.length]} ${
      lastNames[(index * 3) % lastNames.length]
    }`;
    const team = TEAM_OPTIONS[index % TEAM_OPTIONS.length];
    const city = CITY_OPTIONS[index % CITY_OPTIONS.length];
    const status = STATUS_OPTIONS[index % STATUS_OPTIONS.length];
    const joinedMonth = `${((index % 9) + 1).toString().padStart(2, '0')}`;
    const joinedDay = `${((index * 5) % 27) + 1}`.padStart(2, '0');
    const joined = `2025-${joinedMonth}-${joinedDay}`;
    const revenue = 24000 + index * 1875 + (index % 5) * 4200;
    const progress = 18 + ((index * 13) % 82);
    const score = 54 + ((index * 7) % 46);
    const slug = slugify(owner);

    return {
      id,
      owner,
      email: `${slug}@${team.toLowerCase()}.showcase.dev`,
      avatarUri: `https://i.pravatar.cc/80?u=showcase-${id}`,
      team,
      city,
      score,
      progress,
      joined,
      revenue,
      website: `https://showcase.dev/${slug}`,
      status,
      region: REGION_OPTIONS[index % REGION_OPTIONS.length],
      notes:
        status === 'Blocked'
          ? 'Waiting on dependency review before moving the contract to active delivery.'
          : status === 'Review'
            ? 'QA and client feedback are in progress with inline edits enabled for handoff.'
            : status === 'Pending'
              ? 'Pipeline is staffed and scheduled, pending the final go-live confirmation.'
              : 'Delivery is on track with healthy engagement and consistent weekly output.',
    } satisfies GridRow;
  });
}

export function buildVirtualRows(count: number) {
  return Array.from({length: count}, (_, index) => ({
    id: index + 1,
    owner: `Record ${String(index + 1).padStart(5, '0')}`,
    status: STATUS_OPTIONS[index % STATUS_OPTIONS.length],
    score: 48 + ((index * 11) % 52),
  }));
}
