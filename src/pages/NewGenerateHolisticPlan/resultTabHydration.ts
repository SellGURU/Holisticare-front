/** HP-F01: hydrate result_tab from plan responses instead of a separate getResultTab call. */

export const buildResultTabHydration = (resultTab: unknown) => {
  if (!resultTab || !Array.isArray(resultTab) || resultTab.length === 0) {
    return { resultTabData: resultTab ?? null, activeEl: null };
  }
  return { resultTabData: resultTab, activeEl: resultTab[0] };
};
