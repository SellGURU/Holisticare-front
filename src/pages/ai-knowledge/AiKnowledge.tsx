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
      const angle = index * 2.4; // Golden angle in radians
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
  const [filteredUserUploads, setFilteredUserUploads] = useState<Document[]>(
    [],
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;
  const [AddFilleModal, setAddFilleModal] = useState(false);
  const [FilleType] = useState('Activity');
  const [fileTitle, setFileTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadComplete, setUploadComplete] = useState<{
    [key: string]: boolean;
  }>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      // Initialize progress and complete state for new files
      newFiles.forEach((file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        setUploadComplete((prev) => ({ ...prev, [file.name]: false }));
        simulateUploadProgress(file.name);
      });
    }
  };

  const simulateUploadProgress = (fileName: string) => {
    setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[fileName];
        if (currentProgress >= 100) {
          clearInterval(interval);
          setUploadComplete((prev) => ({ ...prev, [fileName]: true }));
          return prev;
        }
        return { ...prev, [fileName]: currentProgress + 10 };
      });
    }, 500);
  };

  const handleCancelUpload = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setUploadComplete((prev) => {
      const newComplete = { ...prev };
      delete newComplete[fileName];
      return newComplete;
    });
  };

  const handleAddFile = () => {
    if (selectedFiles.length > 0) {
      const newUploads = selectedFiles.map((file) => ({
        id: userUploads.length + 1,
        type: fileTitle || file.name,
        date: new Date().toLocaleDateString(),
        disabled: false,
      }));

      setUserUploads((prev) => [...prev, ...newUploads]);
      setSelectedFiles([]);
      setUploadProgress({});
      setUploadComplete({});
      closeModal();
    }
  };

  const closeModal = () => {
    setAddFilleModal(false);
    setSelectedFiles([]);
    setUploadProgress({});
    setUploadComplete({});
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
  type TableItem = {
    id: number;
    type: string;
    date?: string;
    disabled?: boolean;
  };
  const [filteredSystemDocs, setFilteredSystemDocs] = useState<string[]>([]);
  const [isSystemDocsSearchActive, setIsSystemDocsSearchActive] =
    useState(false);

  const getCurrentPageData = (): TableItem[] => {
    if (activaTab === 'System Docs') {
      let categories: string[];
      if (isSystemDocsSearchActive) {
        categories = filteredSystemDocs;
      } else {
        categories = [
          ...new Set(graphData?.nodes.map((e: any) => e.category2)),
        ] as string[];
      }
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return categories.slice(startIndex, endIndex).map((category, index) => ({
        id: index + 1,
        type: category,
      }));
    } else {
      // For User Uploads tab, use filteredUserUploads
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredUserUploads.slice(startIndex, endIndex);
    }
  };

  const totalPages =
    activaTab === 'System Docs'
      ? Math.ceil(
          (filteredSystemDocs.length > 0
            ? filteredSystemDocs.length
            : [...new Set(graphData?.nodes.map((e: any) => e.category2))]
                .length) / itemsPerPage,
        )
      : Math.ceil(filteredUserUploads.length / itemsPerPage);

  const [searchType, setSearchType] = useState<'Docs' | 'Nodes'>('Docs');

  const handleSearch = (term: string) => {
    const searchTerm = term.toLowerCase();

    if (searchType === 'Docs') {
      if (!term.trim()) {
        setFilteredUserUploads(userUploads);
        setFilteredSystemDocs([]);
        setIsSystemDocsSearchActive(false);
        setCurrentPage(1);
      } else {
        if (activaTab === 'User Uploads') {
          const filteredUserDocs = userUploads.filter((doc) =>
            doc.type.toLowerCase().includes(searchTerm),
          );
          setFilteredUserUploads(filteredUserDocs);
        } else if (activaTab === 'System Docs' && graphData) {
          const filteredDocs = graphData.nodes
            .filter((node: any) =>
              node.category2.toLowerCase().includes(searchTerm),
            )
            .map((node: any) => node.category2 as string);
          const uniqueFilteredDocs = [...new Set(filteredDocs)] as string[];
          setFilteredSystemDocs(uniqueFilteredDocs);
          setIsSystemDocsSearchActive(true);
        }
        setCurrentPage(1);
      }
      return;
    }

    // If "Nodes" is selected, only search in the graph
    if (!graphData) return;
    // @ts-expect-error - Accessing the custom property we added to the window object
    const sigmaInstance = window.sigmaInstance;
    if (!sigmaInstance) return;
    const graph = sigmaInstance.getGraph();

    if (!searchTerm.trim()) {
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
    } else {
      const matchingNodes = graphData.nodes
        .filter(
          (node: any) =>
            node.label.toLowerCase().includes(searchTerm) ||
            (node.category1 &&
              node.category1.toLowerCase().includes(searchTerm)) ||
            (node.category2 &&
              node.category2.toLowerCase().includes(searchTerm)),
        )
        .map((node: any) => node.id);

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

      matchingNodes.forEach((nodeId: string) => {
        graph.setNodeAttribute(nodeId, 'hidden', false);
        graph.setNodeAttribute(nodeId, 'highlighted', true);
        graph.setNodeAttribute(
          nodeId,
          'size',
          (graph.getNodeAttribute(nodeId, 'originalSize') || 10) * 1.5,
        );
        graph.forEachEdge((edgeId: string) => {
          const source = graph.source(edgeId);
          const target = graph.target(edgeId);
          if (source === nodeId || target === nodeId) {
            graph.setEdgeAttribute(edgeId, 'hidden', false);
          }
        });
      });
    }
    sigmaInstance.refresh();
  };

  // Initialize filteredUserUploads when userUploads changes
  useEffect(() => {
    setFilteredUserUploads(userUploads);
  }, [userUploads]);

  // Reset filteredUserUploads when switching to User Uploads tab
  useEffect(() => {
    if (activaTab === 'User Uploads') {
      setFilteredUserUploads(userUploads);
    }
  }, [activaTab, userUploads]);

  useEffect(() => {
    getCurrentPageData();
  }, [filteredUserUploads, filteredSystemDocs, currentPage]);

  useEffect(() => {
    if (activaTab === 'System Docs') {
      // do nothing
    } else {
      setIsSystemDocsSearchActive(false);
    }
  }, [activaTab]);

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
                multiple
                type="file"
                accept=".png,.svg,.jpg,.jpeg"
                style={{ display: 'none' }}
                id="file-upload"
                onChange={handleFileUpload}
              />
              <img src="/icons/upload-test.svg" alt="" />
              <div className="text-xs text-[#888888] text-center">
                Supported formats: PNG, SVG, JPG, JPEG
              </div>
              <div className="text-Primary-DeepTeal underline text-xs font-medium">
                Upload File
              </div>
            </label>
            <div className="overflow-auto h-[75px]">
              {selectedFiles.map((file) => (
                <div key={file.name}>
                  {uploadProgress[file.name] > 0 &&
                    uploadProgress[file.name] < 100 && (
                      <div className="w-full relative px-4 py-2 h-[68px] bg-white shadow-200 rounded-[16px] mb-2">
                        <div className="w-full flex justify-between">
                          <div>
                            <div className="text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                              Uploading {file.name}...
                            </div>
                            <div className="text-Text-Secondary text-[10px] md:text-[12px] mt-1">
                              {uploadProgress[file.name]}% • 30 seconds
                              remaining
                            </div>
                          </div>
                          <img
                            onClick={() => handleCancelUpload(file.name)}
                            className="cursor-pointer"
                            src="/icons/close.svg"
                            alt=""
                          />
                        </div>
                        <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
                          <div
                            className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
                            style={{ width: uploadProgress[file.name] + '%' }}
                          ></div>
                        </div>
                      </div>
                    )}
                  {uploadComplete[file.name] && (
                    <div className="flex items-center justify-between bg-white drop-shadow-sm rounded-[12px] px-4 py-2 border border-Gray-50 mb-2">
                      <div className="flex items-center gap-4">
                        <img
                          src="/icons/PDF_file_icon.svg 1.svg"
                          alt="PDF Icon"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs">{file.name}</span>
                          <span className="text-xs text-[#888888]">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>
                      <img
                        onClick={() => handleCancelUpload(file.name)}
                        className="cursor-pointer"
                        src="/icons/trash-blue.svg"
                        alt="Delete Icon"
                      />
                    </div>
                  )}
                </div>
              ))}
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
                placeHolder="Search documents or knowledge graph nodes..."
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
              isGrayIcon
              ClassName="rounded-[12px]"
              placeHolder="Search documents or knowledge graph nodes..."
              onSearch={handleSearch}
            ></SearchBox>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-Text-Primary">
              <span>Search by:</span>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'Docs'}
                  onChange={() => setSearchType('Docs')}
                  className="hidden"
                />
                <span
                  className={`w-3 h-3 rounded-full border flex items-center justify-center mr-1 ${
                    searchType === 'Docs'
                      ? 'border-Primary-DeepTeal'
                      : 'border-[#383838]'
                  }`}
                >
                  {searchType === 'Docs' && (
                    <span className="w-[6px] h-[6px] rounded-full bg-Primary-DeepTeal block"></span>
                  )}
                </span>
                Docs
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'Nodes'}
                  onChange={() => setSearchType('Nodes')}
                  className="hidden"
                />
                <span
                  className={`w-3 h-3 rounded-full border flex items-center justify-center mr-1 ${
                    searchType === 'Nodes'
                      ? 'border-Primary-DeepTeal'
                      : 'border-Text-Primary'
                  }`}
                >
                  {searchType === 'Nodes' && (
                    <span className="w-[6px] h-[6px] rounded-full bg-Primary-DeepTeal block"></span>
                  )}
                </span>
                Nodes
              </label>
            </div>
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
                      {
                      
                      getCurrentPageData().map((doc, index) => (
                        <tr
                          key={doc.id}
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-[#888888] border border-Gray-50`}
                        >
                          <td
                            className={`pl-2 py-2 truncate max-w-[140px] w-[140px] ${doc.disabled ? 'opacity-40' : ''}`}
                          >
                            {doc.type}
                          </td>
                          <td
                            className={`px-2 py-2 w-[90px] text-center ${doc.disabled ? 'opacity-40' : ''}`}
                          >
                            {doc.date || 'No Date'}
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

                  <div className="flex justify-center py-2 absolute bottom-0 w-full">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      isEmpty={getCurrentPageData().length === 0}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
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
                        <th className="w-[40px] py-2 pr-2 text-xs font-medium text-Text-Primary">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentPageData().length < 1 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[480px] w-[315px] text-xs text-Text-Primary">
                          <img className='w-[200px] h-[161px]' src="/icons/search-status.svg" alt="" />
                          No results found.
                         
                        </div>
                      ) : (
                        getCurrentPageData().map((doc, index) => (
                          <tr
                            key={doc.id}
                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-[#888888] border-b border-Gray-50`}
                          >
                            <td
                              className={`pl-2 py-2 truncate max-w-[140px] w-[140px] ${!activeFilters.includes(doc.type) ? 'opacity-40' : ''}`}
                            >
                              {doc.type}
                            </td>
                            <td
                              className={`px-2 py-2 w-[90px] text-center ${!activeFilters.includes(doc.type) ? 'opacity-40' : ''}`}
                            >
                              {doc.date || 'No Date'}
                            </td>
                            <td className="py-2 pr-2 w-[40px] text-center">
                              <button
                                onClick={() => handleButtonClick(doc.type)}
                              >
                                {activeFilters.includes(doc.type) ? (
                                  <img src="/icons/eye-blue.svg" alt="" />
                                ) : (
                                  <img src="/icons/eye-slash-blue.svg" alt="" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="py-2 flex justify-center absolute bottom-0 w-full">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      isEmpty={getCurrentPageData().length === 0}
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
