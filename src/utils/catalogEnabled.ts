export const isCatalogEnabled = (item: { is_enabled?: boolean } | null | undefined) =>
  item?.is_enabled !== false;

export type EnabledFilter = 'All' | 'Enabled' | 'Disabled';

export const matchesEnabledFilter = (
  item: { is_enabled?: boolean } | null | undefined,
  filter: EnabledFilter,
) => {
  if (filter === 'All') return true;
  const enabled = isCatalogEnabled(item);
  return filter === 'Enabled' ? enabled : !enabled;
};
