/* eslint-disable @typescript-eslint/no-explicit-any */
import { SigmaContainer } from "@react-sigma/core";
import { useLoadGraph, useRegisterEvents, useSigma } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { useEffect, useState } from "react";
import Graph from "graphology";
// import  graphDataMock from '../../api/--moch--/data/graph.json';
import chroma from "chroma-js";
// import { ApplicationMock } from "@/api";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import Application from "../../api/app.ts";
const GraphEvents = () => {
    const registerEvents = useRegisterEvents();
    const sigma = useSigma();
    const [draggedNode, setDraggedNode] = useState<string | null>(null);

    useEffect(() => {
        registerEvents({
            downNode: (e:any) => {
                setDraggedNode(e.node);
                const graph = sigma.getGraph();
                graph.setNodeAttribute(e.node, "highlighted", true);
                sigma.refresh();
            },
            mousemovebody: (e:any) => {
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
        });
    }, [registerEvents, sigma, draggedNode]);

    return null;
};

interface LoadGraphProps {
    activeFilters: string[];
    graphData: any; // Use the appropriate type based on your data structure
    isInitialLoad: boolean;
}

const LoadGraph: React.FC<LoadGraphProps> = ({ activeFilters, graphData, isInitialLoad }) => {
    const loadGraph = useLoadGraph();
    const { assign } = useLayoutCircular();

    useEffect(() => {
        if (!graphData) return; // Ensure graphData is available

        const graph = new Graph();

        const nodesToAdd = isInitialLoad
            ? graphData.nodes
            : graphData.nodes.filter(
                (node: any) =>
                    activeFilters.includes(node.category1) || activeFilters.includes(node.category2)
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
                    color: "#fff",
                });
            } else {
                console.warn(`Missing nodes for edge: ${edge.source} -> ${edge.target}`);
            }
        });

        loadGraph(graph);
        assign();
    }, [activeFilters, graphData, isInitialLoad, loadGraph, assign]);

    return null;
};
const AiKnowledge = () => {
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
                if(response.data.nodes){
                    console.log(response.data)
                    setGraphData(response.data);
                    setActiveFilters([...new Set(response.data?.nodes.map((e:any) =>e.category2))] as Array<string>)
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
    const [sigmaSetting,setSigmaSetting] =useState<any>({})
    useEffect(() => {
        setTimeout(() => {
            setSigmaSetting(
                {
                    allowInvalidContainer: false,
                    renderLabels: true,
                    labelColor: { color: "#000" },
                    defaultDrawNodeHover: (context:any, data:any) => {
                        const size = data.size || 10;
                        context.fillStyle = "#fff"; // Dark hover color
                        context.beginPath();
                        context.arc(data.x, data.y, size + 4, 0, Math.PI * 4, true);
                        context.closePath();
                        context.fill();
                    },
                }
            )
        }, 600);
    },[])
    const handleCheckboxChange = (item) => {
        item.checked = !item.checked;
        if (item.children) {
            item.children.forEach((child) => {
                child.checked = item.checked;
                if (child.children) {
                    child.children.forEach((subChild) => {
                        subChild.checked = item.checked;
                    });
                }
            });
        }
        // Update state or trigger re-render here
    };

    return (
        <div className="relative text-primary-text flex justify-center w-full h-[80vh] ">

            <SigmaContainer
                settings={sigmaSetting}
                id="sigma-container"
                className={" !bg-bg-color"}
                style={{height: window.innerHeight - 50, width: window.innerWidth}}
            >
                <LoadGraph graphData={graphData} activeFilters={activeFilters} isInitialLoad={isInitialLoad}/>
                <GraphEvents/>
            </SigmaContainer>

            <div
                className="fixed right-5 top-[8%] w-[400px] h-[80vh] text-primary-textoverflow-y-auto overscroll-y-auto  flex flex-col ">
                <div className="overflow-y-auto  bg-white p-4 rounded-2xl border-Gray-50 border">
                    <div className="mb-4">
                        <h3 className="text-lg text-light-secandary-text mb-2">Documents</h3>
                        <div className="ml-4">
                            {[...new Set(graphData?.nodes.map((e: any) => e.category2))].map((el: any) => {
                                return (
                                    <>
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
                                                {el}
                                            </label>

                                        </div>
                                    </>
                                )
                            })}

                        </div>
                    </div>
                    <div>
                    </div>
                </div>
                <button className={"mt-3 border-dashed flex items-center justify-center gap-2 text-Primary-DeepTeal TextStyle-Button px-8 py-1 border bg-white rounded-2xl border-Primary-DeepTeal "}>
                    <img className={"w-5 h-5"} src={"/icons/add-blue.svg"}/>
                    Add New Document
                </button>
            </div>

        </div>
    );
};

export default AiKnowledge;