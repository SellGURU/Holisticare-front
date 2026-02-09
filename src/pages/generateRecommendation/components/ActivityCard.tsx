/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useRef, useState } from 'react';
import Checkbox from '../../../Components/checkbox';
import ConflictsModal from '../../../Components/NewGenerateActionPlan/components/ConflictsModal';
import TooltipTextAuto from '../../../Components/TooltipText/TooltipTextAuto';
import { splitInstructions } from '../../../help';
import useModalAutoClose from '../../../hooks/UseModalAutoClose';
import ExpandableText from '../../../Components/expandableText';
import {
  CATEGORY_ORDER,
  DEFAULT_CATEGORY_LABELS,
} from '../../../utils/lookingForwards';

interface ActivityCardProps {
  item: any;
  index: number;
  activeCategory: string;
  handleCheckboxChange: (category: string, itemId: number) => void;
  issuesData: Record<string, boolean>[];
  setIssuesData: (value: any) => void;
  keyAreasType2?: {
    'Key areas to address': Record<string, string[]>;
    category_labels?: Record<string, string>;
  };
  handleUpdateIssueListByKey: (
    category: string,
    recommendation: string,
    newIssueList: string[],
    text?: string,
    newIssueCategoryKey?: string,
  ) => void;
  handleRemoveLookingForwards: (text: string) => void;
  handleRemoveIssueFromList: (name: string) => void;
}

export const ActivityCard: FC<ActivityCardProps> = ({
  item,
  index: itemIndex,
  activeCategory,
  handleCheckboxChange,
  issuesData,
  setIssuesData,
  keyAreasType2,
  handleUpdateIssueListByKey,
  handleRemoveLookingForwards,
  handleRemoveIssueFromList: handleRemoveIssueFromListData,
}) => {
  const { positive, negative } = splitInstructions(item.Instruction);
  const [Conflicts] = useState<Array<any>>(item?.flag?.conflicts);
  const [ShowConflict, setShowConflict] = useState(false);
  const [color, setColor] = useState<string>('');
  const [bgColor, setBgColor] = useState<string>('');
  const [showAddIssue, setShowAddIssue] = useState(false);
  const addIssueRef = useRef<HTMLDivElement>(null);
  useModalAutoClose({
    refrence: addIssueRef,
    close: () => {
      setShowAddIssue(false);
    },
  });
  useEffect(() => {
    switch (item?.label) {
      case 'Highly Recommended':
        setColor('#06C78D');
        setBgColor('#DEF7EC');
        break;
      case 'Use Caution':
        setColor('#FFAB2C');
        setBgColor('#F9DEDC');
        break;
      case 'Beneficial':
        setColor('#4C88FF');
        setBgColor('#CADCFF');
        break;
      case 'Avoid':
        setColor('#FC5474');
        setBgColor('#FFD8E4');
        break;
      default:
        setColor('#06C78D');
        setBgColor('#DEF7EC');
        break;
    }
  }, [item?.label]);

  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [addIssue, setAddIssue] = useState(false);
  const [newIssue, setNewIssue] = useState('');
  const [newIssueCategoryKey, setNewIssueCategoryKey] = useState<string>(
    CATEGORY_ORDER[0],
  );
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const lastSentIssueListRef = useRef<string[]>([]);

  useEffect(() => {
    // Build set of all key area issue strings (from type2) so we show issue_list from backend/remap even if coverage keys differ
    const keyAreasSet = new Set<string>();
    const keyAreas = keyAreasType2?.['Key areas to address'];
    if (keyAreas && typeof keyAreas === 'object') {
      for (const arr of Object.values(keyAreas)) {
        if (Array.isArray(arr)) arr.forEach((s: string) => keyAreasSet.add(s));
      }
    }
    const result = (item.issue_list || []).filter((issue: string) =>
      issuesData.some((obj) => Object.keys(obj)[0] === issue) || keyAreasSet.has(issue),
    );
    if (lastSentIssueListRef.current.length > 0) {
      if (
        result.length === lastSentIssueListRef.current.length &&
        result.every((r: string, i: number) => r === lastSentIssueListRef.current[i])
      ) {
        setSelectedIssues(result);
        lastSentIssueListRef.current = [];
      } else {
        setSelectedIssues(lastSentIssueListRef.current);
      }
    } else {
      setSelectedIssues(result);
    }
  }, [issuesData, item, keyAreasType2]);

  const handleRemoveIssueCard = (issue: string) => {
    const newIssueList = selectedIssues.filter((r: string) => r !== issue);
    lastSentIssueListRef.current = newIssueList;
    handleUpdateIssueListByKey(
      activeCategory,
      item.Recommendation,
      newIssueList,
    );
    setSelectedIssues(newIssueList);
  };

  const handleAddIssue = (issue: string) => {
    if (issue.trim() === '') return;
    const name = 'Issue ' + (issuesData.length + 1) + ': ' + issue;
    const newIssueList = [...selectedIssues, name];
    lastSentIssueListRef.current = newIssueList;
    handleUpdateIssueListByKey(
      activeCategory,
      item.Recommendation,
      newIssueList,
      issue,
      newIssueCategoryKey,
    );
    setIssuesData((prev: any) => [...prev, { [name]: true }]);
    setSelectedIssues(newIssueList);
    setNewIssue('');
    setAddIssue(false);
  };

  const categoryLabels =
    keyAreasType2?.category_labels ?? DEFAULT_CATEGORY_LABELS;

  const handleRemoveIssueFromList = (name: string) => {
    handleRemoveIssueFromListData(name);
    setIssuesData((prev: any) => {
      const exists = prev.some((item: any) =>
        Object.prototype.hasOwnProperty.call(item, name),
      );
      if (exists) {
        return prev.filter(
          (item: any) => !Object.prototype.hasOwnProperty.call(item, name),
        );
      }
    });
    handleRemoveLookingForwards(name);

    setIsDeleting(null);
  };

  return (
    <>
      <ConflictsModal
        showModal={ShowConflict}
        setShowModal={setShowConflict}
        conflicts={Conflicts}
      ></ConflictsModal>

      <div className="flex items-center gap-2 mb-3 relative">
        <div className="hidden md:block">
          <Checkbox
            checked={item.checked}
            onChange={() => handleCheckboxChange(activeCategory, itemIndex)}
          />
        </div>

        <ul className="md:pl-8 w-full bg-white rounded-2xl border border-Gray-50 py-3 px-4 text-xs text-Text-Primary">
          <div className="w-full flex flex-wrap gap-3 md:gap-4 items-center mb-2">
            <div className="text-Text-Primary text-xs font-medium flex items-center">
              <div className="block md:hidden">
                <Checkbox
                  checked={item.checked}
                  onChange={() =>
                    handleCheckboxChange(activeCategory, itemIndex)
                  }
                />
              </div>
              <label
                className="block md:hidden font-medium"
                onClick={() => handleCheckboxChange(activeCategory, itemIndex)}
              >
                {' '}
                <TooltipTextAuto tooltipPlace="top" maxWidth="800px">
                  {item.Recommendation}
                </TooltipTextAuto>
              </label>
              <div className="hidden md:block font-medium">
                <TooltipTextAuto tooltipPlace="top" maxWidth="800px">
                  {item.Recommendation}
                </TooltipTextAuto>
              </div>
            </div>
            <div className="flex gap-2 text-[8px]">
              <div
                className={`select-none rounded-full text-nowrap px-2 py-[2px] h-[20px] md:h-auto flex items-center gap-1 text-[8px] text-Text-Primary`}
                style={{ backgroundColor: bgColor }}
              >
                <div
                  className={`size-[8px] select-none rounded-full`}
                  style={{ backgroundColor: color }}
                ></div>
                {item?.label || '-'}
              </div>
              {(item?.fda_status || item?.FDA_Status) &&
                item.Category === 'Medical Peptide Therapy' && (
                  <div
                    className={`select-none rounded-full text-nowrap px-2 py-[2px] h-[20px] md:h-auto flex items-center gap-1 text-[8px] text-Text-Primary`}
                    style={{ backgroundColor: '#FFF4E6', color: '#F97316' }}
                  >
                    <div
                      className={`size-[8px] select-none rounded-full`}
                      style={{ backgroundColor: '#F97316' }}
                    ></div>
                    FDA: {item?.FDA_Status || item?.fda_status}
                  </div>
                )}
              <div className="flex flex-wrap items-center gap-1 ">
                {selectedIssues.map((issue: string, index: number) => (
                  <div
                    key={index}
                    className="text-[10px] text-Primary-DeepTeal flex items-center gap-1 pr-[6px] pl-[10px] rounded-full bg-Secondary-SelverGray text-nowrap"
                  >
                    {issue.split(':')[0].trim()}{' '}
                    <img
                      src="/icons/close-circle.svg"
                      alt=""
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleRemoveIssueCard(issue)}
                    />
                  </div>
                ))}
                <div
                  className="text-[10px] text-Primary-DeepTeal flex items-center gap-1 pr-[6px] pl-[10px] rounded-full bg-Secondary-SelverGray cursor-pointer"
                  onClick={() => setShowAddIssue(true)}
                >
                  Add Issue{' '}
                  <img src="/icons/add-small.svg" alt="" className="w-3 h-3" />
                </div>
                {showAddIssue && (
                  <div
                    ref={addIssueRef}
                    className="flex flex-col absolute right-0 md:right-auto top-10 w-[200px] md:w-[353px] max-h-[282px] overflow-y-auto rounded-md border border-Gray-50 bg-white p-2 md:p-4 shadow-200 z-10"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#E9EDF5 #FFFFFF',
                    }}
                  >
                    {(() => {
                      const labels =
                        keyAreasType2?.category_labels ??
                        DEFAULT_CATEGORY_LABELS;
                      const keyAreas = keyAreasType2?.['Key areas to address'];
                      const issuesDataFlat = issuesData ?? [];
                      const hasCategories =
                        keyAreas && typeof keyAreas === 'object';

                      const renderIssueRow = (
                        _issue: Record<string, boolean>,
                        index: number,
                        text: string,
                        issueLabel: string,
                        isInSelected: boolean,
                        handleToggle: () => void,
                      ) => (
                        <div
                          key={text}
                          className="flex select-none text-[10px] text-justify items-center break-all text-Text-Primary text-xs group relative pr-5 py-1"
                        >
                          <Checkbox
                            width="w-3"
                            height="h-3"
                            checked={isInSelected}
                            onChange={handleToggle}
                          />
                          <span className="text-Text-Secondary text-[10px] text-nowrap mr-1">
                            {issueLabel}:{' '}
                          </span>
                          <div className="text-[10px] ">
                            {text?.split(':')[1]?.trim()}
                          </div>
                          {isDeleting === index + 1 ? (
                            <div className="flex flex-col items-center justify-center gap-[2px] absolute -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <img
                                src="/icons/tick-circle-green.svg"
                                alt=""
                                className="w-[20px] h-[20px] cursor-pointer"
                                onClick={() => {
                                  handleRemoveIssueFromList(text);
                                  const newSelected = selectedIssues.filter(
                                    (r: string) =>
                                      r.split(':')[0].trim() !== issueLabel,
                                  );
                                  lastSentIssueListRef.current = newSelected;
                                  setSelectedIssues(newSelected);
                                  handleUpdateIssueListByKey(
                                    activeCategory,
                                    item.Recommendation,
                                    newSelected,
                                  );
                                }}
                              />
                              <img
                                src="/icons/close-circle-red.svg"
                                alt=""
                                className="w-[20px] h-[20px] cursor-pointer"
                                onClick={() => setIsDeleting(null)}
                              />
                            </div>
                          ) : (
                            <img
                              src="/icons/delete.svg"
                              alt=""
                              className="absolute -right-3 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 cursor-pointer"
                              onClick={() => setIsDeleting(index + 1)}
                            />
                          )}
                        </div>
                      );

                      if (hasCategories) {
                        // Coverage state from API: issue string -> boolean
                        const coverageMap: Record<string, boolean> = {};
                        for (const entry of issuesDataFlat) {
                          const k = Object.keys(entry)[0];
                          if (k) coverageMap[k] = entry[k];
                        }
                        // List all issues from type2 by category (so dropdown shows all key areas, not only coverage keys)
                        const byCategory: Record<
                          string,
                          { entry: Record<string, boolean> }[]
                        > = {};
                        for (const catKey of CATEGORY_ORDER)
                          byCategory[catKey] = [];
                        for (const catKey of CATEGORY_ORDER) {
                          const list = keyAreas[catKey];
                          if (Array.isArray(list)) {
                            for (const issueName of list) {
                              if (typeof issueName === 'string')
                                byCategory[catKey].push({
                                  entry: {
                                    [issueName]: coverageMap[issueName] ?? false,
                                  },
                                });
                            }
                          }
                        }
                        let globalIndex = 0;
                        return CATEGORY_ORDER.map((catKey) => {
                          const categoryLabel = labels[catKey] ?? catKey;
                          const arr = byCategory[catKey] ?? [];
                          if (arr.length === 0) return null;
                          return (
                            <div key={catKey} className="mb-2">
                              <div className="text-[10px] font-semibold text-Text-Primary mb-1 pt-1 first:pt-0 border-t border-Gray-50 first:border-t-0">
                                {categoryLabel}
                              </div>
                              {arr.map(({ entry }) => {
                                const [text] = Object.entries(entry)[0];
                                const issueLabel = text.split(':')[0].trim();
                                const isInSelected = selectedIssues.some(
                                  (r: string) =>
                                    r.split(':')[0].trim() === issueLabel,
                                );
                                const idx = globalIndex++;
                                const handleToggle = () => {
                                  const newSelected = isInSelected
                                    ? item.issue_list.filter(
                                        (r: string) => r !== text,
                                      )
                                    : [...item.issue_list, text];
                                  lastSentIssueListRef.current = newSelected;
                                  handleUpdateIssueListByKey(
                                    activeCategory,
                                    item.Recommendation,
                                    newSelected,
                                  );
                                  const newIssueList = isInSelected
                                    ? selectedIssues.filter(
                                        (r: string) =>
                                          r.split(':')[0].trim() !== issueLabel,
                                      )
                                    : [...selectedIssues, text];
                                  setSelectedIssues(newIssueList);
                                };
                                return renderIssueRow(
                                  entry,
                                  idx,
                                  text,
                                  issueLabel,
                                  isInSelected,
                                  handleToggle,
                                );
                              })}
                            </div>
                          );
                        });
                      }

                      return issuesDataFlat.map((issue, index) => {
                        const [text] = Object.entries(issue)[0];
                        const issueLabel = text.split(':')[0].trim();
                        const isInSelected = selectedIssues.some(
                          (r: string) => r.split(':')[0].trim() === issueLabel,
                        );
                        const handleToggle = () => {
                          const newSelected = isInSelected
                            ? item.issue_list.filter((r: string) => r !== text)
                            : [...item.issue_list, text];
                          lastSentIssueListRef.current = newSelected;
                          handleUpdateIssueListByKey(
                            activeCategory,
                            item.Recommendation,
                            newSelected,
                          );
                          const newIssueList = isInSelected
                            ? selectedIssues.filter(
                                (r: string) =>
                                  r.split(':')[0].trim() !== issueLabel,
                              )
                            : [...selectedIssues, text];
                          setSelectedIssues(newIssueList);
                        };
                        return renderIssueRow(
                          issue,
                          index,
                          text,
                          issueLabel,
                          isInSelected,
                          handleToggle,
                        );
                      });
                    })()}
                    {(!issuesData || issuesData.length < 1) && (
                      <div className="flex flex-col items-center justify-center mb-2">
                        <img src="/icons/empty-state-issue.svg" alt="" />
                        <div className="text-Text-Primary text-[10px] font-medium -mt-5">
                          No issues found.
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 text-Primary-DeepTeal text-xs font-medium border-t border-Gray-50 rounded-md pt-3 mt-2">
                      {addIssue ? (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-Text-Secondary">
                              Category
                            </label>
                            <select
                              value={newIssueCategoryKey}
                              onChange={(e) =>
                                setNewIssueCategoryKey(e.target.value)
                              }
                              className="w-full h-[28px] px-2 outline-none bg-backgroundColor-Card border border-Gray-50 rounded-lg text-Text-Primary text-[10px]"
                            >
                              {CATEGORY_ORDER.map((catKey) => (
                                <option key={catKey} value={catKey}>
                                  {categoryLabels[catKey] ?? catKey}
                                </option>
                              ))}
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Type new issue and press Enter..."
                            value={newIssue}
                            onChange={(e) => setNewIssue(e.target.value)}
                            className="w-full h-[28px] px-2 outline-none bg-backgroundColor-Card border border-Gray-50 rounded-2xl text-Text-Primary placeholder:text-Text-Fivefold text-[10px]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddIssue(newIssue);
                              }
                            }}
                          />
                        </>
                      ) : (
                        <div
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => setAddIssue(true)}
                        >
                          <img
                            src="/icons/add-small.svg"
                            alt=""
                            className="w-5 h-5"
                          />
                          Create new issue
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* <div
                data-tooltip-id="system-score"
                className="bg-[#E2F1F8] select-none rounded-full px-2 flex items-center gap-1 cursor-pointer"
              >
                <div className="size-[5px] select-none bg-[#005F73] rounded-full"></div>
                {item['System Score'] ? item['System Score'] : '-'}
                <Tooltip
                  id={'system-score'}
                  place="top"
                  className="!bg-white !w-[162px] !text-justify  !leading-5 !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                  style={{
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="text-Text-Primary">System Score</div>
                  <div className="text-Text-Secondary">
                    Score based on all data and AI insights.
                  </div>
                </Tooltip>
              </div> */}
              {/* <div
                data-tooltip-id="base-score"
                className="bg-[#DAF6C6] select-none rounded-full px-2 flex items-center gap-1 cursor-pointer"
              >
                <div className="size-[5px] select-none bg-[#6CC24A] rounded-full"></div>
                {item.Score ? item.Score : '-'}
                <Tooltip
                  id={'base-score'}
                  place="top"
                  className="!bg-white !w-[162px] !leading-5 !text-justify  !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                  style={{
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="text-Text-Primary">Base Score</div>
                  <div className="text-Text-Secondary">
                    Initial score from core health metrics.
                  </div>
                </Tooltip>
              </div> */}
              {/* <div
                data-tooltip-id={index + 'score-calc'}
                className="text-Primary-DeepTeal select-none mt-[2px] text-[8px]"
              >
                Analysis Info{' '}
                <Tooltip
                  id={index + 'score-calc'}
                  place="top"
                  className="!bg-white !bg-opacity-100 !opacity-100 !w-[270px] text-justify !leading-5 !text-wrap !text-[#888888] !text-[8px] !rounded-[6px] !border !border-Gray-50 !p-2"
                  style={{
                    zIndex: 9999,
                    pointerEvents: 'none',
                  }}
                >
                  <div className="text-Text-Primary text-[8px]">
                    {item['Practitioner Comments'][0]}
                  </div>
                </Tooltip>
              </div> */}
              {Conflicts?.length > 0 && (
                <div
                  onClick={() => setShowConflict(true)}
                  className="ml-3 mb-[2px] flex gap-[2px] items-center text-[10px] text-[#F4A261] underline cursor-pointer"
                >
                  <img src="/icons/alarm.svg" alt="" />
                  Conflict <span>({Conflicts?.length})</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full bg-bg-color h-[1px] mt-1"></div>
          {item['Practitioner Comments'][0]?.length > 0 && (
            <div className="flex flex-col gap-1 pl-3 mt-2 mb-2">
              <div className="flex items-center gap-1 text-xs text-Primary-DeepTeal">
                <img src="/icons/info-circle-blue.svg" alt="" />
                Analysis Info
              </div>
              <ExpandableText
                text={item['Practitioner Comments'][0]}
                lines={2}
                className="text-[#666666] leading-5 text-xs text-justify"
              />
            </div>
          )}
          <div className="w-full bg-bg-color h-[1px] mt-1 mb-2"></div>
          <li className="mb-1.5 text-justify">
            <span className="text-Text-Secondary bullet-point">
              Key Benefits:
            </span>{' '}
            {positive}
          </li>
          <li className=" text-justify">
            <span className="text-Text-Secondary bullet-point">Key Risks:</span>{' '}
            {negative}
          </li>
        </ul>
      </div>
    </>
  );
};
