/* eslint-disable @typescript-eslint/no-explicit-any */
import { SigmaContainer } from '@react-sigma/core';
import { useLoadGraph, useRegisterEvents, useSigma } from '@react-sigma/core';
import '@react-sigma/core/lib/react-sigma.min.css';
import { useEffect, useRef, useState } from 'react';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
// import  graphDataMock from '../../api/--moch--/data/graph.json';
import chroma from 'chroma-js';
// import { ApplicationMock } from "@/api";
import { useLayoutCircular } from '@react-sigma/layout-circular';
import Application from '../../api/app.ts';
import SearchBox from '../../Components/SearchBox/index.tsx';
import Circleloader from '../../Components/CircleLoader/index.tsx';
import ActivityMenu from '../../Components/ActivityMenu/index.tsx';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary.tsx';
import useModalAutoClose from '../../hooks/UseModalAutoClose.ts';
import Toggle from '../../Components/Toggle/index.tsx';
import Pagination from '../../Components/pagination/index.tsx';

interface LoadGraphProps {
  activeFilters: string[];
  graphData: any; // Use the appropriate type based on your data structure
  isInitialLoad: boolean;
}
type menuItem = {
  name: string;
};
const LoadGraph: React.FC<LoadGraphProps> = ({
  activeFilters,
  graphData,
  isInitialLoad,
}) => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutCircular();

  useEffect(() => {
    if (!graphData) return; // Ensure graphData is available

    const graph = new Graph();

    const nodesToAdd = isInitialLoad
      ? graphData.nodes
      : graphData.nodes.filter(
          (node: any) =>
            activeFilters.includes(node.category1) ||
            activeFilters.includes(node.category2),
        );

    const nodeSet = new Set(nodesToAdd.map((node: any) => node.id));

    nodesToAdd.forEach((node: any) => {
      const randomColor = chroma.random().hex();
      graph.addNode(node.id, {
        label: node.label,
        size: node.size,
        color: randomColor,
        x: Math.random(),
        y: Math.random(),
      });
    });

    graphData.edges.forEach((edge: any, index: number) => {
      if (nodeSet.has(edge.source) && nodeSet.has(edge.target)) {
        graph.addEdgeWithKey(`edge-${index}`, edge.source, edge.target, {
          weight: edge.weight,
          color: '#696969',
        });
      } else {
        console.warn(
          `Missing nodes for edge: ${edge.source} -> ${edge.target}`,
        );
      }
    });

    forceAtlas2.assign(graph, {
      iterations: 100, // Number of iterations to stabilize layout
      settings: {
        gravity: 1, // Controls node clustering
        scalingRatio: 20, // Space between nodes
      },
    });
    loadGraph(graph);
    // assign();
  }, [activeFilters, graphData, isInitialLoad, loadGraph, assign]);

  return null;
};
const GraphEvents = ({
  setisLoading,
}: {
  setisLoading: (action: boolean) => void;
}) => {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  useEffect(() => {
    registerEvents({
      downNode: (e: any) => {
        setDraggedNode(e.node);
        const graph = sigma.getGraph();
        graph.setNodeAttribute(e.node, 'highlighted', true);
        sigma.refresh();
      },
      mousemovebody: (e: any) => {
        if (!draggedNode) return;
        const pos = sigma.viewportToGraph(e);
        sigma.getGraph().setNodeAttribute(draggedNode, 'x', pos.x);
        sigma.getGraph().setNodeAttribute(draggedNode, 'y', pos.y);
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
      },
      mouseup: () => {
        if (draggedNode) {
          const graph = sigma.getGraph();
          graph.removeNodeAttribute(draggedNode, 'highlighted');
          setDraggedNode(null);
          sigma.refresh();
        }
      },
      afterRender: () => {
        setisLoading(false); // Disable loading state
      },
    });
  }, [registerEvents, sigma, draggedNode]);

  return null;
};
const AiKnowledge = () => {
  const [isLoading, setisLoading] = useState(true);

  // const [isContractsOpen, setIsContractsOpen] = useState(true);
  // const [isAgreementsOpen, setIsAgreementsOpen] = useState(true);
  // const [isReportsOpen, setIsReportsOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [graphData, setGraphData] = useState<any>(null); // Adjust the type as needed

  // const categories = [
  //   "Health",
  //   "Fitness",
  //   "Aging",
  //   "Symptoms",
  //   "Interventions",
  //   "Wellness",
  //   "Exercise",
  //   "Mental Health",
  //   "Nutrition",
  //   "Strength"
  // ];
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await Application.getgraphData();
        if (response.data.nodes) {
          console.log(response.data);
          setGraphData(response.data);
          setActiveFilters([
            ...new Set(response.data?.nodes.map((e: any) => e.category2)),
          ] as Array<string>);
        }
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };

    fetchGraphData();
  }, []);
  const handleButtonClick = (category: string) => {
    setIsInitialLoad(false);
    setActiveFilters((prevFilters) =>
      prevFilters.includes(category)
        ? prevFilters.filter((filter) => filter !== category)
        : [...prevFilters, category],
    );
  };
  const [sigmaSetting, setSigmaSetting] = useState<any>({});
  useEffect(() => {
    setTimeout(() => {
      setSigmaSetting({
        allowInvalidContainer: false,
        renderLabels: true,
        labelColor: { color: '#000' },
        defaultDrawNodeHover: (context: any, data: any) => {
          const size = data.size || 10;
          context.fillStyle = '#fff'; // Dark hover color
          context.beginPath();
          context.arc(data.x, data.y, size + 4, 0, Math.PI * 4, true);
          context.closePath();
          context.fill();
        },
      });
    }, 600);
  }, []);
  // const handleCheckboxChange = (item:any) => {
  //     item.checked = !item.checked;
  //     if (item.children) {
  //         item.children.forEach((child:any) => {
  //             child.checked = item.checked;
  //             if (child.children) {
  //                 child.children.forEach((subChild:any) => {
  //                     subChild.checked = item.checked;
  //                 });
  //             }
  //         });
  //     }
  //     // Update state or trigger re-render here
  // };
  const [activeMenu, setActiveMenu] = useState('All');
  const menus: Array<menuItem> = [
    // { name: "Overview" },
    { name: 'All' },

    { name: 'Holistic Plan' },
    { name: 'Action Plan' },

    // { name: "Generate Report" },
  ];
  const modalRef = useRef(null);
  const btnRef = useRef(null);
  const [showDoc, setShowDoc] = useState(false);
  useModalAutoClose({
    refrence: modalRef,
    buttonRefrence: btnRef,
    close: () => setShowDoc(false),
  });

  const [activaTab, setActiveTab] = useState('System Docs');

  type Document = {
    id: number;
    type: string;
    date: string;
    disabled: boolean;
  };
  
  const [systemDocs, setSystemDocs] = useState<Document[]>([
    { id: 1, type: 'Diseases and Conditions', date: '04/25/2024', disabled: false },
    { id: 2, type: 'Symptoms', date: '04/25/2024', disabled: false },
    // Add more mock data as needed
  ]);

  const [userUploads, setUserUploads] = useState<Document[]>([
    { id: 1, type: 'Uploaded Document 1', date: '03/15/2024', disabled: false },
    { id: 2, type: 'Uploaded Document 2', date: '03/16/2024', disabled: false },
    // Add more mock data as needed
  ]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 13;
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  const toggleDisable = (id: number, tab: string) => {
    if (tab === 'System Docs') {
      setSystemDocs((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === id ? { ...doc, disabled: !doc.disabled } : doc
        )
      );
    } else if (tab === 'User Uploads') {
      setUserUploads((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === id ? { ...doc, disabled: !doc.disabled } : doc
        )
      );
    }
  };

  const deleteDocument = (id: number) => {
    setUserUploads((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
    setConfirmDeleteId(null);
  };

  const currentDocuments = 
  activaTab === 'System Docs'
      ? systemDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      : userUploads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = 
  activaTab === 'System Docs'
      ? Math.ceil(systemDocs.length / itemsPerPage)
      : Math.ceil(userUploads.length / itemsPerPage);

  return (
    <div className="relative text-primary-text md:flex justify-center w-full h-[90vh] md:h-[80vh] pt-5 md:pt-0 ">
      <div className=" w-full flex md:hidden items-center justify-start gap-2 text-sm font-medium text-Text-Primary">
        <img src="/icons/command-square.svg" alt="" />
        AI Knowledge
      </div>
      <div className="pt-5 md:hidden ">
        <ActivityMenu
          activeMenu={activeMenu}
          menus={menus}
          onChangeMenuAction={(menu) => setActiveMenu(menu)}
        ></ActivityMenu>
      </div>
      {/* <div className=" w-full flex  justify-center items-start">
        <SigmaContainer
          settings={sigmaSetting}
          id="sigma-container"
          className={' !bg-bg-color'}
          style={{ height: window.innerHeight - 50, width: window.innerWidth }}
        >
          {isLoading && <Circleloader></Circleloader>}
          <LoadGraph
            graphData={graphData}
            activeFilters={activeFilters}
            isInitialLoad={isInitialLoad}
          />
          <GraphEvents setisLoading={setisLoading} />
        </SigmaContainer>
      </div> */}

      <div className="w-full absolute bottom-6 flex md:hidden justify-center ">
        <ButtonSecondary
          onClick={() => setShowDoc(true)}
          style={{ width: '344px' }}
        >
          {' '}
          <img src="/icons/additem.svg" alt="" /> Nodes & Documents
        </ButtonSecondary>
      </div>
      {showDoc ? (
        <div className="fixed w-full inset-0 flex items-center justify-center bg-[#4E4E4E66] bg-opacity-40 backdrop-blur-[4px] px-4">
          <div
            ref={modalRef}
            className="bg-white h-[80vh] w-full   border-[2px] border-Gray-50 rounded-2xl p-4 shadow-600"
          >
            <div className=" mb-4  flex justify-between items-center text-Primary-DeepTeal text-sm font-medium">
              Nodes & Documents
              <img
                ref={btnRef}
                onClick={() => setShowDoc(false)}
                src="/icons/close.svg"
                alt=""
              />
            </div>
            <SearchBox
              isHaveBorder
              ClassName="rounded-[12px]"
              placeHolder="Search for document ..."
              onSearch={() => {}}
            ></SearchBox>
            <ActivityMenu
              activeMenu={activeMenu}
              menus={menus}
              onChangeMenuAction={(menu) => setActiveMenu(menu)}
            />
            <button
              className={
                'mt-3 w-full border-dashed flex items-center justify-center gap-2 text-Primary-DeepTeal TextStyle-Button px-8 py-1 border bg-white rounded-2xl border-Primary-DeepTeal '
              }
            >
              <img className={'w-5 h-5'} src={'/icons/add-blue.svg'} />
              Add New Document
            </button>
            <div className="overflow-y-auto h-[68%]   bg-white p-4 rounded-2xl border-Gray-50 border mt-3">
              <div className="mb-4">
                <h3 className="text-lg text-light-secandary-text mb-2">
                  Documents
                </h3>
                <div className="">
                  {[
                    ...new Set(graphData?.nodes.map((e: any) => e.category2)),
                  ].map((el: any) => {
                    return (
                      <>
                        <label
                          onClick={() => {
                            handleButtonClick(el);
                          }}
                          htmlFor="contracts"
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={activeFilters.includes(el)}
                            onChange={() => {
                              handleButtonClick(el);
                            }}
                            className="hidden"
                          />
                          <div
                            className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Primary-DeepTeal ${
                              activeFilters.includes(el)
                                ? 'bg-Primary-DeepTeal'
                                : ' bg-white '
                            }`}
                          >
                            {activeFilters.includes(el) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="break-words text-nowrap overflow-hidden w-[300px] text-ellipsis ml-2 text-Text-Primary TextStyle-Headline-6">
                            {el}
                          </span>
                        </label>

                        {/* <div className="flex mb-2 justify-start items-center">
                                              <input checked={activeFilters.includes(el)} onChange={() => {
                                                  handleButtonClick(el)
                                              }} type="checkbox"
                                                     className="mr-2 peer shrink-0 w-4 h-4 text-blue-600 bg-white border-2 border-Primary-DeepTeal rounded"/>
                                              <label
                                                  onClick={() => {
                                                      handleButtonClick(el)
                                                  }}
                                                  htmlFor="contracts"
                                                  className="ml-2 text-Text-Primary TextStyle-Headline-6 flex gap-1"
                                              >
                                                  <div className="break-words text-nowrap overflow-hidden w-[300px] text-ellipsis">
                                                      {el}
  
                                                  </div>
                                              </label>
  
                                          </div> */}
                      </>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className=" hidden fixed right-5 top-[8%] w-[315px] h-[80vh] text-primary-text  md:flex flex-col ">
          <SearchBox
            ClassName="rounded-[12px]"
            placeHolder="Search for document ..."
            onSearch={() => {}}
          ></SearchBox>
          <div className="mt-3 w-full">
            <Toggle
              active={activaTab}
              value={['System Docs', 'User Uploads']}
              setActive={(menu) => setActiveTab(menu)}
            ></Toggle>
          </div>
          {activaTab == 'User Uploads' ? (
            <>
              <button
                className={
                  'mt-3 border-dashed flex items-center justify-center gap-2 text-Primary-DeepTeal TextStyle-Button px-8 py-1 border bg-white rounded-2xl border-Primary-DeepTeal '
                }
              >
                <img className={'w-5 h-5'} src={'/icons/add-blue.svg'} />
                Add New Document
              </button>
              <div className="mx-auto bg-white rounded-2xl pb-4 shadow-100 overflow-hidden mt-2 min-h-[520px] relative w-[315px]">
            <table className="min-w-full bg-white ">
              <thead>
                <tr className="bg-[#E5E5E5]">
                  <th className="w-[140px] text-left pl-2 py-2 text-xs font-medium text-Text-Primary">
                    Node Type
                  </th>
                  <th className="w-[90px] py-2 text-xs font-medium text-Text-Primary">
                    Date of Update
                  </th>
                  <th className="w-[60px] text-right py-2 pr-2 text-xs font-medium text-Text-Primary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentDocuments.map((doc, index) => (
                  <tr
                    key={doc.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-[#888888]`}
                  >
                    <td className={`pl-2 py-2 w-[140px] ${doc.disabled ? 'opacity-40' : ''}`}>
                      {doc.type}
                    </td>
                    <td className={`px-2 py-2 w-[90px] text-center ${doc.disabled ? 'opacity-40' : ''}`}>
                      {doc.date}
                    </td>
                    <td className="py-2 pr-2 w-[80px] text-right flex items-center justify-end gap-2">
                      {confirmDeleteId === doc.id ? (
                        <div className="flex items-center gap-1 text-[10px] text-Text-Primary ">
                          Sure?
                          <img
                            className="cursor-pointer size-4"
                            onClick={() => deleteDocument(doc.id)}
                            src="/icons/confirm-tick-circle.svg"
                            alt="Confirm"
                          />
                          <img
                            className="cursor-pointer size-4 "
                            onClick={() => setConfirmDeleteId(null)}
                            src="/icons/cansel-close-circle.svg"
                            alt="Cancel"
                          />
                        </div>
                      ) : (
                        <>
                          <button onClick={() => toggleDisable(doc.id, 'User Uploads')}>
                            {doc.disabled ? (
                              <img src="/icons/eye-slash-blue.svg" alt="Disabled" />
                            ) : (
                              <img src="/icons/eye-blue.svg" alt="Enabled" />
                            )}
                          </button>
                          <button onClick={() => setConfirmDeleteId(doc.id)}>
                            <img src="/icons/trash-blue.svg" alt="Delete" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-center pb-4 absolute bottom-0 w-full">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
            </>
          ) : (
            <>
              <div className=" mx-auto bg-white rounded-2xl pb-4 shadow-100 overflow-hidden mt-2 min-h-[520px] relative w-[315px]">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-[#E5E5E5]">
                      <th className="w-[140px] text-left pl-2 py-2 text-xs font-medium text-Text-Primary">
                        Node Type
                      </th>
                      <th className="w-[90px] py-2 text-xs font-medium text-Text-Primary">
                        Date of Update
                      </th>
                      <th className="w-[40px] py-2 pr-2 text-xs font-medium text-Text-Primary">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDocuments.map((doc, index) => (
                      <tr
                        key={doc.id}
                        className={`${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-[#888888]`}
                      >
                        <td
                          className={`pl-2 py-2 w-[140px] ${doc.disabled ? 'opacity-40' : ''}`}
                        >
                          {doc.type}
                        </td>
                        <td
                          className={`px-2 py-2 w-[90px] text-center ${doc.disabled ? 'opacity-40' : ''}`}
                        >
                          {doc.date}
                        </td>
                        <td className="py-2 pr-2 w-[40px] text-center">
                          <button onClick={() => toggleDisable(doc.id)}>
                            {doc.disabled ? (
                              <img
                                src="/icons/eye-slash-blue.svg"
                                alt=""
                              /> // Eye icon for disabled
                            ) : (
                              <img src="/icons/eye-blue.svg" alt="" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-center pb-4 absolute bottom-0 w-full">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </>
          )}

          {/*<div className="overflow-y-auto   bg-white p-4 rounded-2xl border-Gray-50 border mt-3">
            <div className="mb-4">
              <h3 className="text-lg text-light-secandary-text mb-2">
                Documents
              </h3>
              <div className="ml-4">
                {[
                  ...new Set(graphData?.nodes.map((e: any) => e.category2)),
                ].map((el: any) => {
                  return (
                    <>
                      <label
                        onClick={() => {
                          handleButtonClick(el);
                        }}
                        htmlFor="contracts"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={activeFilters.includes(el)}
                          onChange={() => {
                            handleButtonClick(el);
                          }}
                          className="hidden"
                        />
                        <div
                          className={`w-4 h-4 flex items-center justify-center rounded border-[0.5px] border-Primary-DeepTeal ${
                            activeFilters.includes(el)
                              ? 'bg-Primary-DeepTeal'
                              : ' bg-white '
                          }`}
                        >
                          {activeFilters.includes(el) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="break-words text-nowrap overflow-hidden w-[300px] text-ellipsis ml-2 text-Text-Primary TextStyle-Headline-6">
                          {el}
                        </span>
                      </label>

                       <div className="flex mb-2 justify-start items-center">
                                            <input checked={activeFilters.includes(el)} onChange={() => {
                                                handleButtonClick(el)
                                            }} type="checkbox"
                                                   className="mr-2 peer shrink-0 w-4 h-4 text-blue-600 bg-white border-2 border-Primary-DeepTeal rounded"/>
                                            <label
                                                onClick={() => {
                                                    handleButtonClick(el)
                                                }}
                                                htmlFor="contracts"
                                                className="ml-2 text-Text-Primary TextStyle-Headline-6 flex gap-1"
                                            >
                                                <div className="break-words text-nowrap overflow-hidden w-[300px] text-ellipsis">
                                                    {el}

                                                </div>
                                            </label>

                                        </div> 
                    </>
                  );
                })}
              </div>
            </div>
            <div></div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default AiKnowledge;
