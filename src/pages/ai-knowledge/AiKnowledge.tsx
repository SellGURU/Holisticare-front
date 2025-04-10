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
import Application from '../../api/app.ts';
import SearchBox from '../../Components/SearchBox/index.tsx';
import Circleloader from '../../Components/CircleLoader/index.tsx';
import ActivityMenu from '../../Components/ActivityMenu/index.tsx';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary.tsx';
import useModalAutoClose from '../../hooks/UseModalAutoClose.ts';
import Toggle from '../../Components/Toggle/index.tsx';
import Pagination from '../../Components/pagination/index.tsx';
import { MainModal } from '../../Components/index.ts';
import CustomSelect from '../../Components/CustomSelect/index.tsx';
import TextField from '../../Components/TextField/index.tsx';

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

  useEffect(() => {
    if (!graphData) return; // Ensure graphData is available

    const graph = new Graph();

    // Initialize nodes with more centered positions
    const centerX = 0.5;
    const centerY = 0.5;
    const radius = 0.3; // Smaller initial radius to start nodes closer to center

    // Always add all nodes to the graph with better initial positions
    graphData.nodes.forEach((node: any, index: number) => {
      const randomColor = chroma.random().hex();
      // Calculate initial position in a spiral pattern
      const angle = (index * 2.4); // Golden angle in radians
      const r = radius * Math.sqrt(index / graphData.nodes.length);
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      graph.addNode(node.id, {
        label: node.label,
        size: node.size,
        color: randomColor,
        x: x,
        y: y,
        originalSize: node.size,
        category1: node.category1,
        category2: node.category2,
      });
    });

    // Always add all edges to the graph with full opacity
    graphData.edges.forEach((edge: any, index: number) => {
      graph.addEdgeWithKey(`edge-${index}`, edge.source, edge.target, {
        weight: edge.weight,
        color: '#d6d6d6',
        width: 1,
      });
    });

    // Apply optimized force layout settings
    forceAtlas2.assign(graph, {
      iterations: 100, // Reduced iterations as we have better initial positions
      settings: {
        gravity: 1, // Increased gravity to pull nodes toward center
        scalingRatio: 2, // Reduced scaling ratio for tighter packing
        strongGravityMode: true, // Enable strong gravity mode to prevent empty center
        slowDown: 2, // Faster cooling for quicker convergence
        edgeWeightInfluence: 2, // Increased edge influence for better clustering
        barnesHutOptimize: true,
        barnesHutTheta: 0.5, // More precise force calculation
        linLogMode: false,
        adjustSizes: true,
        outboundAttractionDistribution: true, // Enable outbound attraction for better distribution
      },
    });

    // Run a second pass of force layout with different settings to refine positions
    forceAtlas2.assign(graph, {
      iterations: 50,
      settings: {
        gravity: 0.5,
        scalingRatio: 1,
        strongGravityMode: true,
        slowDown: 5,
        edgeWeightInfluence: 1,
        barnesHutOptimize: true,
        barnesHutTheta: 0.5,
        linLogMode: false,
        adjustSizes: true,
        outboundAttractionDistribution: false,
      },
    });
    
    // If not initial load, hide nodes that don't match the active filters
    if (!isInitialLoad && activeFilters.length > 0) {
      const visibleNodes = new Set<string>();
      
      graphData.nodes.forEach((node: any) => {
        if (
          activeFilters.includes(node.category1) ||
          activeFilters.includes(node.category2)
        ) {
          visibleNodes.add(node.id);
        }
      });
      
      // Hide nodes that don't match the filters
      graph.forEachNode((nodeId: string) => {
        if (!visibleNodes.has(nodeId)) {
          graph.setNodeAttribute(nodeId, 'hidden', true);
        }
      });
      
      // Hide edges connected to hidden nodes
      graph.forEachEdge((edgeId: string) => {
        const source = graph.source(edgeId);
        const target = graph.target(edgeId);
        
        if (!visibleNodes.has(source) || !visibleNodes.has(target)) {
          graph.setEdgeAttribute(edgeId, 'hidden', true);
        }
      });
    }
    
    loadGraph(graph);
  }, [activeFilters, graphData, isInitialLoad, loadGraph]);

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

  // Store sigma instance in a ref so it can be accessed by the search function
  useEffect(() => {
    if (sigma) {
      // Store the sigma instance in a ref that can be accessed by the parent component
      const sigmaInstance = sigma;
      // @ts-expect-error - Adding a custom property to the window object
      window.sigmaInstance = sigmaInstance;
    }
  }, [sigma]);

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
    
    // Update the active filters state
    const newActiveFilters = activeFilters.includes(category)
      ? activeFilters.filter((filter) => filter !== category)
      : [...activeFilters, category];
    
    setActiveFilters(newActiveFilters);
    
    // Apply the filter immediately using the sigma instance
    // @ts-expect-error - Accessing the custom property we added to the window object
    const sigmaInstance = window.sigmaInstance;
    
    if (sigmaInstance && graphData) {
      const graph = sigmaInstance.getGraph();
      
      // If no filters are active, show all nodes
      if (newActiveFilters.length === 0) {
        graph.forEachNode((nodeId: string) => {
          graph.setNodeAttribute(nodeId, 'hidden', false);
          graph.setNodeAttribute(nodeId, 'highlighted', false);
          graph.setNodeAttribute(
            nodeId,
            'size',
            graph.getNodeAttribute(nodeId, 'originalSize') || 10,
          );
        });
        
        graph.forEachEdge((edgeId: string) => {
          graph.setEdgeAttribute(edgeId, 'hidden', false);
        });
        
        sigmaInstance.refresh();
        return;
      }
      
      // First, hide all nodes and edges
      graph.forEachNode((nodeId: string) => {
        graph.setNodeAttribute(nodeId, 'hidden', true);
        graph.setNodeAttribute(nodeId, 'highlighted', false);
        graph.setNodeAttribute(
          nodeId,
          'size',
          graph.getNodeAttribute(nodeId, 'originalSize') || 10,
        );
      });
      
      graph.forEachEdge((edgeId: string) => {
        graph.setEdgeAttribute(edgeId, 'hidden', true);
      });
      
      // Find nodes that match the active filters
      const visibleNodes = new Set<string>();
      
      graphData.nodes.forEach((node: any) => {
        if (
          newActiveFilters.includes(node.category1) ||
          newActiveFilters.includes(node.category2)
        ) {
          visibleNodes.add(node.id);
        }
      });
      
      // Show and highlight matching nodes
      visibleNodes.forEach((nodeId: string) => {
        graph.setNodeAttribute(nodeId, 'hidden', false);
        graph.setNodeAttribute(nodeId, 'highlighted', true);
        graph.setNodeAttribute(
          nodeId,
          'size',
          (graph.getNodeAttribute(nodeId, 'originalSize') || 10) * 1.2,
        );
        
        // Show edges connected to matching nodes
        graph.forEachEdge((edgeId: string) => {
          const source = graph.source(edgeId);
          const target = graph.target(edgeId);
          
          if (source === nodeId || target === nodeId) {
            graph.setEdgeAttribute(edgeId, 'hidden', false);
          }
        });
      });
      
      sigmaInstance.refresh();
    }
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
        // Add settings for hidden nodes and edges
        defaultNodeColor: { color: '#1f77b4' },
        defaultEdgeColor: { color: '#999999' }, // #999999 with 100% opacity
        defaultNodeSize: 10,
        defaultEdgeWidth: 0.8, // Slightly thinner edges
        // Increase min camera ratio to zoom out and show more of the graph
        minCameraRatio: 0.1,
        // Increase max camera ratio to allow more zoom in
        maxCameraRatio: 10,
        // Adjust label rendering for better visibility
        labelRenderedSizeThreshold: 5,
        labelSize: 12,
        labelSizeRatio: 1,
        // Custom rendering for nodes
        defaultDrawNode: (context: any, data: any) => {
          // Skip rendering if node is hidden
          if (data.hidden) return;
          
          const size = data.size || 10;
          const color = data.color || '#1f77b4';
          
          // Draw node with a slight transparency for better visibility
          context.globalAlpha = 0.8;
          context.fillStyle = color;
          context.beginPath();
          context.arc(data.x, data.y, size, 0, Math.PI * 2, true);
          context.closePath();
          context.fill();
          
          // Reset transparency
          context.globalAlpha = 1;
          
          // Draw label if available
          if (data.label) {
            context.fillStyle = '#000';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(data.label, data.x, data.y + size + 10);
          }
        },
        // Custom rendering for edges with full opacity
        defaultDrawEdge: (context: any, data: any) => {
          // Skip rendering if edge is hidden
          if (data.hidden) return;
          
          const source = data.source;
          const target = data.target;
          
          // Draw edge with full opacity
          context.globalAlpha = 1.0; // 100% opacity
          context.strokeStyle = data.color || '#999999'; // #999999 with 100% opacity
          context.lineWidth = data.width || 0.8; // Slightly thinner edges
          
          context.beginPath();
          context.moveTo(source.x, source.y);
          context.lineTo(target.x, target.y);
          context.stroke();
          
          // Reset transparency (not needed but kept for consistency)
          context.globalAlpha = 1;
        }
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

  // const [systemDocs, ] = useState<Document[]>([
  //   {
  //     id: 1,
  //     type: 'Diseases and Conditions',
  //     date: '04/25/2024',
  //     disabled: false,
  //   },
  //   { id: 2, type: 'Symptoms', date: '04/25/2024', disabled: false },
  //   // Add more mock data as needed
  // ]);

  const [userUploads, setUserUploads] = useState<Document[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 13;
  const [AddFilleModal, setAddFilleModal] = useState(false);
  const [FilleType] = useState('Activity');
  const [fileTitle, setFileTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadComplete(false);
      simulateUploadProgress();
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadComplete(true);
          // Add file to user uploads
          if (selectedFile) {
            setUserUploads((prevUploads) => [
              ...prevUploads,
              {
                id: prevUploads.length + 1,
                type: selectedFile.name,
                date: new Date().toLocaleDateString(),
                disabled: false,
              },
            ]);
          }
          return prev;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleCancelUpload = () => {
    setUploadProgress(0);
    setSelectedFile(null);
    setUploadComplete(false);
  };

  const closeModal = () => {
    setAddFilleModal(false);
    setUploadProgress(0);
    setSelectedFile(null);
    setUploadComplete(false);
    setFileTitle('');
  };

  const formatFileSize = (size: number): string => {
    if (size === 0) return '0 B';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizeInUnits = (size / Math.pow(1024, i)).toFixed(2);
    return `${sizeInUnits} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleDisable = (id: number, tab: string) => {
    if (tab === 'System Docs') {
      // setSystemDocs((prevDocs) =>
      //   prevDocs.map((doc) =>
      //     doc.id === id ? { ...doc, disabled: !doc.disabled } : doc,
      //   ),
      // );
    } else if (tab === 'User Uploads') {
      setUserUploads((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === id ? { ...doc, disabled: !doc.disabled } : doc,
        ),
      );
    }
  };

  const deleteDocument = (id: number) => {
    setUserUploads((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
    setConfirmDeleteId(null);
  };

  // const currentDocuments =
  //   activaTab === 'System Docs'
  //     ? systemDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  //     : userUploads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages =
    activaTab === 'System Docs'
      ? Math.ceil(
          [...new Set(graphData?.nodes.map((e: any) => e.category2))].length /
            itemsPerPage,
        )
      : Math.ceil(userUploads.length / itemsPerPage);
  const handleAddFile = () => {
    if (selectedFile) {
      setUserUploads((prevUploads) => [
        ...prevUploads,
        {
          id: prevUploads.length + 1,
          type: fileTitle,
          date: new Date().toLocaleDateString(),
          disabled: false,
        },
      ]);
      closeModal();
    }
  };

  const handleSearch = (term: string) => {
    if (!graphData || !term.trim()) {
      // If search is cleared, show all nodes
      // @ts-expect-error - Accessing the custom property we added to the window object
      const sigmaInstance = window.sigmaInstance;

      if (sigmaInstance) {
        const graph = sigmaInstance.getGraph();

        // Show all nodes
        graph.forEachNode((nodeId: string) => {
          graph.setNodeAttribute(nodeId, 'hidden', false);
          graph.setNodeAttribute(nodeId, 'highlighted', false);
          graph.setNodeAttribute(
            nodeId,
            'size',
            graph.getNodeAttribute(nodeId, 'originalSize') || 10,
          );
        });

        // Show all edges
        graph.forEachEdge((edgeId: string) => {
          graph.setEdgeAttribute(edgeId, 'hidden', false);
        });

        sigmaInstance.refresh();
      }
      return;
    }

    const matchingNodes = graphData.nodes
      .filter(
        (node: any) =>
          node.label.toLowerCase().includes(term.toLowerCase()) ||
          (node.category1 &&
            node.category1.toLowerCase().includes(term.toLowerCase())) ||
          (node.category2 &&
            node.category2.toLowerCase().includes(term.toLowerCase())),
      )
      .map((node: any) => node.id);

    // Access the sigma instance from the window object
    // @ts-expect-error - Accessing the custom property we added to the window object
    const sigmaInstance = window.sigmaInstance;

    if (sigmaInstance) {
      const graph = sigmaInstance.getGraph();

      // First, hide all nodes and edges
      graph.forEachNode((nodeId: string) => {
        graph.setNodeAttribute(nodeId, 'hidden', true);
        graph.setNodeAttribute(nodeId, 'highlighted', false);
        graph.setNodeAttribute(
          nodeId,
          'size',
          graph.getNodeAttribute(nodeId, 'originalSize') || 10,
        );
      });

      graph.forEachEdge((edgeId: string) => {
        graph.setEdgeAttribute(edgeId, 'hidden', true);
      });

      // Then show and highlight matching nodes
      matchingNodes.forEach((nodeId: string) => {
        graph.setNodeAttribute(nodeId, 'hidden', false);
        graph.setNodeAttribute(nodeId, 'highlighted', true);
        graph.setNodeAttribute(
          nodeId,
          'size',
          (graph.getNodeAttribute(nodeId, 'originalSize') || 10) * 1.5,
        );

        // Show edges connected to matching nodes
        graph.forEachEdge((edgeId: string) => {
          const source = graph.source(edgeId);
          const target = graph.target(edgeId);

          if (source === nodeId || target === nodeId) {
            graph.setEdgeAttribute(edgeId, 'hidden', false);
          }
        });
      });

      sigmaInstance.refresh();
    }
  };

  return (
    <>
      <MainModal isOpen={AddFilleModal} onClose={closeModal}>
        <div className="w-[434px] bg-white h-[500px] rounded-2xl shadow-800 p-4 text-xs text-Text-Primary">
          <div className="border-b border-Gray-50 pb-2 text-sm font-medium">
            Add New Document
          </div>
          <div className="mt-6 w-full flex-col flex gap-6">
            <CustomSelect
              wfull
              selectedOption={FilleType}
              onOptionSelect={() => {}}
              options={[]}
              label="Type"
              placeHolder="Activity"
            />
            <TextField
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              newStyle
              type="text"
              label="Title"
              placeholder="Enter title name ..."
            />
            <label className="w-full h-[154px] rounded-2xl border border-Gray-50 bg-white shadow-100 flex flex-col items-center justify-center gap-3 p-6 cursor-pointer">
              <input
                type="file"
                // accept=".rdf,.owl,.csv,.json,.pdf"
                style={{ display: 'none' }}
                id="file-upload"
                onChange={handleFileUpload}
              />
              <img src="/icons/upload-test.svg" alt="" />
              <div className="text-xs text-[#888888] text-center">
                Supported formats: RDF, OWL, CSV, JSON, PDF
              </div>
              <div className="text-Primary-DeepTeal underline text-xs font-medium">
                Upload File
              </div>
            </label>
            <div className="overflow-auto h-[75px]">
              {selectedFile && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full relative px-4 py-2 h-[68px] bg-white shadow-200 rounded-[16px]">
                  <div className="w-full flex justify-between">
                    <div>
                      <div className="text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                        Uploading {selectedFile.name}...
                      </div>
                      <div className="text-Text-Secondary text-[10px] md:text-[12px] mt-1">
                        {uploadProgress}% • 30 seconds remaining
                      </div>
                    </div>
                    <img
                      onClick={handleCancelUpload}
                      className="cursor-pointer"
                      src="/icons/close.svg"
                      alt=""
                    />
                  </div>
                  <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
                    <div
                      className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
                      style={{ width: uploadProgress + '%' }}
                    ></div>
                  </div>
                </div>
              )}
              {selectedFile && uploadComplete && (
                <div className="flex items-center justify-between bg-white drop-shadow-sm rounded-[12px] px-4 py-2 border border-Gray-50">
                  <div className="flex items-center gap-4">
                    <img src="/icons/PDF_file_icon.svg 1.svg" alt="PDF Icon" />
                    <div className="flex flex-col">
                      <span className="text-xs">{selectedFile.name}</span>
                      <span className="text-xs text-[#888888]">
                        {formatFileSize(selectedFile.size)}
                      </span>
                    </div>
                  </div>
                  <img
                    onClick={handleCancelUpload}
                    className="cursor-pointer"
                    src="/icons/trash-blue.svg"
                    alt="Delete Icon"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex items-center justify-end gap-2 text-sm font-medium">
            <div onClick={closeModal} className="text-[#909090] cursor-pointer">
              Cancel
            </div>
            <div
              onClick={handleAddFile}
              className="text-Primary-DeepTeal cursor-pointer "
            >
              Add
            </div>
          </div>
        </div>
      </MainModal>
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
        <div className=" w-full flex  justify-center items-start">
          <SigmaContainer
            settings={sigmaSetting}
            id="sigma-container"
            className={' !bg-bg-color'}
            style={{
              height: window.innerHeight - 50,
              width: window.innerWidth,
            }}
          >
            {isLoading && <Circleloader></Circleloader>}
            <LoadGraph
              graphData={graphData}
              activeFilters={activeFilters}
              isInitialLoad={isInitialLoad}
            />
            <GraphEvents setisLoading={setisLoading} />
          </SigmaContainer>
        </div>

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
                onSearch={handleSearch}
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
              onSearch={handleSearch}
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
                  onClick={() => setAddFilleModal(true)}
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
                        <th className="w-[60px] text-right py-2 pr-3 text-xs font-medium text-Text-Primary">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userUploads.map((doc, index) => (
                        <tr
                          key={doc.id}
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-[#888888]`}
                        >
                          <td
                            className={`pl-2 py-2 truncate max-w-[140px] w-[140px] ${doc.disabled ? 'opacity-40' : ''}`}
                          >
                            {doc.type}
                          </td>
                          <td
                            className={`px-2 py-2 w-[90px] text-center ${doc.disabled ? 'opacity-40' : ''}`}
                          >
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
                                <button
                                  onClick={() =>
                                    toggleDisable(doc.id, 'User Uploads')
                                  }
                                >
                                  {doc.disabled ? (
                                    <img
                                      src="/icons/eye-slash-blue.svg"
                                      alt="Disabled"
                                    />
                                  ) : (
                                    <img
                                      src="/icons/eye-blue.svg"
                                      alt="Enabled"
                                    />
                                  )}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(doc.id)}
                                >
                                  <img
                                    src="/icons/trash-blue.svg"
                                    alt="Delete"
                                  />
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
                <div className=" mx-auto bg-white rounded-2xl pb-4 shadow-100 overflow-hidden mt-2 min-h-[520px] relative w-[315px] ">
                  <div className="max-h-[510px] overflow-auto">
                    <table className="min-w-full bg-white ">
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
                        {[
                          ...new Set(
                            graphData?.nodes.map((e: any) => e.category2),
                          ),
                        ].map((doc: any, index: number) => {
                          return (
                            <tr
                              key={doc.id}
                              className={`${index % 2 == 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-[#888888]`}
                            >
                              <td
                                className={`pl-2 py-2 max-w-[140px] truncate w-[140px] ${!activeFilters.includes(doc) ? 'opacity-40' : ''}`}
                              >
                                {doc}
                              </td>
                              <td
                                className={`px-2 py-2 w-[90px] text-center ${!activeFilters.includes(doc) ? 'opacity-40' : ''}`}
                              >
                                {doc.date || 'No Date'}
                              </td>
                              <td className="py-2 pr-2 w-[40px] text-center">
                                <button
                                  onClick={() =>
                                    // toggleDisable(doc.id, 'System Uploads')
                                    handleButtonClick(doc)
                                  }
                                >
                                  {activeFilters.includes(doc) ? (
                                    <img src="/icons/eye-blue.svg" alt="" />
                                  ) : (
                                    // Eye icon for disabled
                                    <img
                                      src="/icons/eye-slash-blue.svg"
                                      alt=""
                                    />
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="hidden justify-center pb-4 absolute bottom-0 w-full">
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
    </>
  );
};

export default AiKnowledge;
