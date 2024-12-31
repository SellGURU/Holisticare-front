/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SigmaContainer } from "@react-sigma/core";
import { useLoadGraph, useRegisterEvents, useSigma } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { useEffect, useState } from "react";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
// import  graphDataMock from '../../api/--moch--/data/graph.json';
import chroma from "chroma-js";
// import { ApplicationMock } from "@/api";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import Application from "../../api/app.ts";

interface LoadGraphProps {
  activeFilters: string[];
  graphData: any; // Use the appropriate type based on your data structure
  isInitialLoad: boolean;
}

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
            activeFilters.includes(node.category2)
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
          color: "#696969",
        });
      } else {
        console.warn(
          `Missing nodes for edge: ${edge.source} -> ${edge.target}`
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
const GraphEvents = ({setisLoading}:{setisLoading:(action:boolean)=>void}) => {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  useEffect(() => {
    registerEvents({
      downNode: (e: any) => {
        setDraggedNode(e.node);
        const graph = sigma.getGraph();
        graph.setNodeAttribute(e.node, "highlighted", true);
        sigma.refresh();
      },
      mousemovebody: (e: any) => {
        if (!draggedNode) return;
        const pos = sigma.viewportToGraph(e);
        sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
        sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
      },
      mouseup: () => {
        if (draggedNode) {
          const graph = sigma.getGraph();
          graph.removeNodeAttribute(draggedNode, "highlighted");
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
        console.error("Error fetching graph data:", error);
      }
    };

    fetchGraphData();
  }, []);
  const handleButtonClick = (category: string) => {
    setIsInitialLoad(false);
    setActiveFilters((prevFilters) =>
      prevFilters.includes(category)
        ? prevFilters.filter((filter) => filter !== category)
        : [...prevFilters, category]
    );
  };
  const [sigmaSetting, setSigmaSetting] = useState<any>({});
  useEffect(() => {
    setTimeout(() => {
      setSigmaSetting({
        allowInvalidContainer: false,
        renderLabels: true,
        labelColor: { color: "#000" },
        defaultDrawNodeHover: (context: any, data: any) => {
          const size = data.size || 10;
          context.fillStyle = "#fff"; // Dark hover color
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

  return (
    <div className="relative text-primary-text flex justify-center w-full h-[80vh] ">
      <SigmaContainer
        settings={sigmaSetting}
        id="sigma-container"
        className={" !bg-bg-color"}
        style={{ height: window.innerHeight - 50, width: window.innerWidth }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "35%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              padding: "10px",
              borderRadius: "5px",
              textAlign: "center",
            }}
          >
            <div className="spinner">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="dot"></div>
              ))}
            </div>
          </div>
        )}
        <LoadGraph
          graphData={graphData}
          activeFilters={activeFilters}
          isInitialLoad={isInitialLoad}
        />
        <GraphEvents  setisLoading={setisLoading}/>
      </SigmaContainer>

      <div className="fixed right-5 top-[8%] w-[400px] h-[80vh] text-primary-textoverflow-y-auto overscroll-y-auto  flex flex-col ">
        <div className="overflow-y-auto  bg-white p-4 rounded-2xl border-Gray-50 border">
          <div className="mb-4">
            <h3 className="text-lg text-light-secandary-text mb-2">
              Documents
            </h3>
            <div className="ml-4">
              {[...new Set(graphData?.nodes.map((e: any) => e.category2))].map(
                (el: any) => {
                  return (
                    <>
                      <label
                         onClick={() => {
                            handleButtonClick(el)
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
                              ? "bg-Primary-DeepTeal"
                              : " bg-white "
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
                        <span className="break-words text-nowrap overflow-hidden w-[300px] text-ellipsis ml-2 text-Text-Primary TextStyle-Headline-6" >
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
                }
              )}
            </div>
          </div>
          <div></div>
        </div>
        <button
          className={
            "mt-3 border-dashed flex items-center justify-center gap-2 text-Primary-DeepTeal TextStyle-Button px-8 py-1 border bg-white rounded-2xl border-Primary-DeepTeal "
          }
        >
          <img className={"w-5 h-5"} src={"/icons/add-blue.svg"} />
          Add New Document
        </button>
      </div>
    </div>
  );
};

export default AiKnowledge;
