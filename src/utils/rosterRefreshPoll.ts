export type RefreshProgressClient = {
  member_id: number;
  refresh_in_progress?: boolean;
};

export function dedupeInProgressMemberIds(
  clients: RefreshProgressClient[],
): number[] {
  return [
    ...new Set(
      clients
        .filter((client) => client.refresh_in_progress)
        .map((client) => client.member_id),
    ),
  ];
}

export async function pollRefreshProgressForMembers(
  memberIds: number[],
  checkProgress: (
    memberId: number,
  ) => Promise<{ status?: boolean } | null | undefined>,
): Promise<number[]> {
  const uniqueIds = [...new Set(memberIds)];
  if (uniqueIds.length === 0) {
    return [];
  }

  const results = await Promise.all(
    uniqueIds.map(async (memberId) => {
      const result = await checkProgress(memberId);
      return { memberId, completed: Boolean(result?.status) };
    }),
  );

  return results
    .filter((entry) => entry.completed)
    .map((entry) => entry.memberId);
}
