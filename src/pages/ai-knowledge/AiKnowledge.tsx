/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSigma,
} from '@react-sigma/core';
import '@react-sigma/core/lib/react-sigma.min.css';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
// import  graphDataMock from '../../api/--moch--/data/graph.json';
import chroma from 'chroma-js';
// import { ApplicationMock } from "@/api";
import Application from '../../api/app.ts';
import ActivityMenu from '../../Components/ActivityMenu/index.tsx';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary.tsx';
import Circleloader from '../../Components/CircleLoader/index.tsx';
import Pagination from '../../Components/pagination/index.tsx';
import SearchBox from '../../Components/SearchBox/index.tsx';
import Toggle from '../../Components/Toggle/index.tsx';
import useModalAutoClose from '../../hooks/UseModalAutoClose.ts';
import AddNewDocument from './AddNewDocument.tsx';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('AI Knowledge Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
          <h2>Something went wrong.</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy loading constants
const VIRTUAL_SCROLL_ITEM_HEIGHT = 40; // Height of each table row
const VIRTUAL_SCROLL_VISIBLE_ITEMS = 20; // Number of visible items

interface LoadGraphProps {
  activeFilters: string[];
  graphData: any;
  isInitialLoad: boolean;
  onLoadProgress?: (
    progress: number,
    loadedCount: number,
    totalCount: number,
  ) => void;
}

const LoadGraph: FC<LoadGraphProps> = ({
  activeFilters,
  graphData,
  isInitialLoad,
  onLoadProgress,
}) => {
  const loadGraph = useLoadGraph();
  const [loadedNodes, setLoadedNodes] = useState<Set<string>>(new Set());
  const [isLoadingChunk, setIsLoadingChunk] = useState(false);

  // Memoize filtered nodes to prevent unnecessary recalculations
  const filteredNodes = useMemo(() => {
    if (!graphData?.nodes) return [];

    return graphData.nodes
      .filter((item: any) => item.size > 1 && item.status === true)
      .slice(0, 10000); // Only load first 1000 nodes
  }, [graphData]);

  // Load all nodes at once (only first 1000)
  const loadNodes = useCallback(
    async (nodes: any[]) => {
      if (isLoadingChunk) return;

      setIsLoadingChunk(true);
      const graph = new Graph();

      const centerX = 0.5;
      const centerY = 0.5;
      const radius = 0.3;

      // Load all nodes at once
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        const randomColor = chroma.random().hex();
        const angle = i * 2.4;
        const r = radius * Math.sqrt(i / nodes.length);
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

        setLoadedNodes((prev) => new Set([...prev, node.id]));

        // Report progress
        if (onLoadProgress) {
          const progress = ((i + 1) / nodes.length) * 100;
          onLoadProgress(progress, i + 1, nodes.length);
        }

        // Yield control to prevent blocking
        if (i % 100 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      // Load edges for all nodes
      if (graphData?.edges) {
        const nodeIds = new Set(nodes.map((n: any) => n.id));
        const inactiveNodeIds = new Set(
          graphData.nodes
            .filter((node: any) => node.status === false)
            .map((node: any) => node.id),
        );

        const filteredEdges = graphData.edges.filter((link: any) => {
          return (
            nodeIds.has(link.source) &&
            nodeIds.has(link.target) &&
            !inactiveNodeIds.has(link.source) &&
            !inactiveNodeIds.has(link.target)
          );
        });

        filteredEdges.forEach((edge: any, index: number) => {
          graph.addEdgeWithKey(`edge-${index}`, edge.source, edge.target, {
            weight: edge.weight,
            color: '#d6d6d6',
            width: 1,
          });
        });
      }

      // Apply force layout
      if (graph.order > 10) {
        forceAtlas2.assign(graph, {
          iterations: 50,
          settings: {
            gravity: 1,
            scalingRatio: 2,
            strongGravityMode: true,
            slowDown: 2,
            edgeWeightInfluence: 2,
            barnesHutOptimize: true,
            barnesHutTheta: 0.5,
            linLogMode: false,
            adjustSizes: true,
            outboundAttractionDistribution: true,
          },
        });
      }

      loadGraph(graph);
      setIsLoadingChunk(false);
    },
    [loadGraph, graphData, onLoadProgress, isLoadingChunk],
  );

  // Start loading nodes when graph data is available
  useEffect(() => {
    if (filteredNodes.length > 0 && loadedNodes.size === 0 && !isLoadingChunk) {
      // Load all nodes at once
      loadNodes(filteredNodes);
    }
  }, [filteredNodes, loadedNodes.size, isLoadingChunk, loadNodes]);

  // Handle filter changes
  useEffect(() => {
    if (!isInitialLoad && activeFilters.length > 0 && graphData) {
      // @ts-expect-error - Accessing the custom property we added to the window object
      const sigmaInstance = window.sigmaInstance;
      if (!sigmaInstance) return;

      const graph = sigmaInstance.getGraph();
      const visibleNodes = new Set<string>();

      filteredNodes.forEach((node: any) => {
        if (
          activeFilters.includes(node.category1) ||
          activeFilters.includes(node.category2)
        ) {
          visibleNodes.add(node.id);
        }
      });

      // Hide/show nodes based on filters
      graph.forEachNode((nodeId: string) => {
        const shouldBeVisible = visibleNodes.has(nodeId);
        graph.setNodeAttribute(nodeId, 'hidden', !shouldBeVisible);
        graph.setNodeAttribute(nodeId, 'highlighted', shouldBeVisible);
        graph.setNodeAttribute(
          nodeId,
          'size',
          shouldBeVisible
            ? (graph.getNodeAttribute(nodeId, 'originalSize') || 10) * 1.2
            : graph.getNodeAttribute(nodeId, 'originalSize') || 10,
        );
      });

      // Hide/show edges
      graph.forEachEdge((edgeId: string) => {
        const source = graph.source(edgeId);
        const target = graph.target(edgeId);
        const shouldBeVisible =
          visibleNodes.has(source) && visibleNodes.has(target);
        graph.setEdgeAttribute(edgeId, 'hidden', !shouldBeVisible);
      });

      sigmaInstance.refresh();
    }
  }, [activeFilters, isInitialLoad, filteredNodes, graphData]);

  return null;
};

// Virtual Scrolling Component for Table
const VirtualScrollTable = ({
  items,
  itemHeight = VIRTUAL_SCROLL_ITEM_HEIGHT,
  visibleItems = VIRTUAL_SCROLL_VISIBLE_ITEMS,
  renderItem,
}: {
  items: any[];
  itemHeight?: number;
  visibleItems?: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItems, items.length);
  const visibleItemsData = items.slice(startIndex, endIndex);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto pb-[45px] "
      style={{ height: visibleItems * itemHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItemsData.map((item, index) =>
            renderItem(item, startIndex + index),
          )}
        </div>
      </div>
    </div>
  );
};

type menuItem = {
  name: string;
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
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadedNodesCount, setLoadedNodesCount] = useState(0);
  const [totalNodesCount, setTotalNodesCount] = useState(0);
  console.log(isLoading, loadProgress);

  // const [isContractsOpen, setIsContractsOpen] = useState(true);
  // const [isAgreementsOpen, setIsAgreementsOpen] = useState(true);
  // const [isReportsOpen, setIsReportsOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const handleActiveFilters = (value: string[]) => {
    setActiveFilters(value);
  };
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [graphData, setGraphData] = useState<any>(null); // Adjust the type as needed
  const handleGraphData = (value: any) => {
    setGraphData(value);
  };

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
  const fetchGraphData = async () => {
    try {
      await Application.getgraphData().then((res) => {
        if (res.data.nodes) {
          setGraphData(res.data);
          // setisLoading(false);
          setActiveFilters([
            ...new Set(res.data?.nodes.map((e: any) => e.category2)),
          ] as Array<string>);
        }
      });
    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };
  useEffect(() => {
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
        allowInvalidContainer: true,
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

  const [filteredUserUploads, setFilteredUserUploads] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [currentPageUserUploads, setCurrentPageUserUploads] =
    useState<number>(1);
  const [currentPageSystemDocs, setCurrentPageSystemDocs] = useState<number>(1);
  const itemsPerPageUserUploads = 12;
  const itemsPerPageSystemDocs = 12;
  const [AddFilleModal, setAddFilleModal] = useState(false);
  const handleAddFilleModal = (value: boolean) => {
    setAddFilleModal(value);
  };
  const [isLoadingCallApi, setIsLoadingCallApi] = useState(false);

  // const simulateUploadProgress = (fileName: string) => {
  //   setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));
  //   const interval = setInterval(() => {
  //     setUploadProgress((prev) => {
  //       const currentProgress = prev[fileName];
  //       if (currentProgress >= 100) {
  //         clearInterval(interval);
  //         setUploadComplete((prev) => ({ ...prev, [fileName]: true }));
  //         return prev;
  //       }
  //       return { ...prev, [fileName]: currentProgress + 10 };
  //     });
  //   }, 500);
  // };

  // const handleAddFile = () => {
  //   if (selectedFiles.length > 0) {
  //     const newUploads = selectedFiles.map((file) => ({
  //       id: userUploads.length + 1,
  //       type: fileTitle || file.name,
  //       date: new Date().toLocaleDateString(),
  //       disabled: false,
  //     }));

  //     setUserUploads((prev) => [...prev, ...newUploads]);
  //     setSelectedFiles([]);
  //     setUploadProgress({});
  //     setUploadComplete({});
  //     closeModal();
  //   }
  // };

  const handleDeleteFileUserUpload = (fileName: string) => {
    setIsLoadingCallApi(true);
    setisLoading(true);
    Application.deleteUserUploadDocument({
      filename: fileName,
    })
      .then(() => {
        fetchGraphData();
        setConfirmDeleteId(null);
        setisLoading(false);
        setIsLoadingCallApi(false);
      })
      .finally(() => {});
  };

  const handleDownloadFileUserUpload = (filename: string) => {
    Application.downloadUserUploadDocumentKnowledge({
      filename: filename,
    })
      .then((res: any) => {
        const blobUrl = res.data.link;

        // Create a direct download link for the blob URL
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(() => {
        console.log('error');
      });
  };
  const handleDownloadFileSystemDocs = (filename: string) => {
    Application.downloadSystemDocumentKnowledge({
      filename: filename,
    })
      .then((res: any) => {
        const blobUrl = res.data.link;

        // Create a direct download link for the blob URL
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((e: any) => {
        console.log(e);
      });
  };

  const handlePageChangeUserUploads = (page: number) => {
    setCurrentPageUserUploads(page);
  };
  const handlePageChangeSystemDocs = (page: number) => {
    setCurrentPageSystemDocs(page);
  };

  // const toggleDisable = async (
  //   filename: string,
  //   tab: string,
  //   disabled: boolean,
  // ) => {
  //   if (tab === 'System Docs') {
  //     if (disabled) {
  //       setIsLoadingCallApi(true);
  //       await Application.hideSystemDocumentKnowledge({
  //         filename: filename,
  //       })
  //         .then(() => {
  //           fetchGraphData();
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         })
  //         .finally(() => {
  //           setIsLoadingCallApi(false);
  //         });
  //     } else {
  //       setIsLoadingCallApi(true);
  //       await Application.unhideSystemDocumentKnowledge({
  //         filename: filename,
  //       })
  //         .then(() => {
  //           fetchGraphData();
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         })
  //         .finally(() => {
  //           setIsLoadingCallApi(false);
  //         });
  //     }
  //     // setSystemDocs((prevDocs) =>
  //     //   prevDocs.map((doc) =>
  //     //     doc.id === id ? { ...doc, disabled: !doc.disabled } : doc,
  //     //   ),
  //     // );
  //   } else if (tab === 'User Uploads') {
  //     if (disabled) {
  //       setIsLoadingCallApi(true);
  //       await Application.hideUserUploadDocumentKnowledge({
  //         filename: filename,
  //       })
  //         .then(() => {
  //           fetchGraphData();
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         })
  //         .finally(() => {
  //           setIsLoadingCallApi(false);
  //         });
  //     } else {
  //       setIsLoadingCallApi(true);
  //       await Application.unhideUserUploadDocumentKnowledge({
  //         filename: filename,
  //       })
  //         .then(() => {
  //           fetchGraphData();
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         })
  //         .finally(() => {
  //           setIsLoadingCallApi(false);
  //         });
  //     }
  //     // setUserUploads((prevDocs) =>
  //     //   prevDocs.map((doc) =>
  //     //     doc.id === id ? { ...doc, disabled: !doc.disabled } : doc,
  //     //   ),
  //     // );
  //   }
  // };

  // const deleteDocument = (id: number) => {
  //   setUserUploads((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
  //   setConfirmDeleteId(null);
  // };

  // const currentDocuments =
  //   activaTab === 'System Docs'
  //     ? systemDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  //     : userUploads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  // type TableItem = {
  //   id: number;
  //   type: string;
  //   date?: string;
  //   disabled?: boolean;
  // };
  type TableItem = {
    category1: string;
    category2: string;
    id: number;
    label: string;
    size: number;
    type: string;
    upload_date: number;
    status: boolean;
  };
  const [filteredSystemDocs, setFilteredSystemDocs] = useState<string[]>([]);
  const [isSystemDocsSearchActive, setIsSystemDocsSearchActive] =
    useState(false);
  const [isUserUploadsSearchActive, setIsUserUploadsSearchActive] =
    useState(false);

  // const getCurrentPageData = (): TableItem[] => {
  //   if (activaTab === 'System Docs') {
  //     let categories: string[];
  //     if (isSystemDocsSearchActive) {
  //       categories = filteredSystemDocs;
  //     } else {
  //       categories = [
  //         ...new Set(graphData?.nodes.map((e: any) => e.category2)),
  //       ] as string[];
  //     }
  //     const startIndex = (currentPage - 1) * itemsPerPage;
  //     const endIndex = startIndex + itemsPerPage;
  //     return categories.slice(startIndex, endIndex).map((category, index) => ({
  //       id: index + 1,
  //       type: category,
  //     }));
  //   } else {
  //     // For User Uploads tab, use filteredUserUploads
  //     const startIndex = (currentPage - 1) * itemsPerPage;
  //     const endIndex = startIndex + itemsPerPage;
  //     return filteredUserUploads.slice(startIndex, endIndex);
  //   }
  // };
  // const [totalPageUserDocs, setTotalPageUserDocs] = useState(0);
  // const [totalPageSystemDocs, setTotalPageSystemDocs] = useState(0);
  let totalPageSystemDocs = 0;
  let totalPageUserDocs = 0;
  const getCurrentPageData = (): TableItem[] => {
    const seenDocuments = new Set<string>();
    let filteredDocs: TableItem[] = [];

    if (activaTab === 'System Docs') {
      const rawFiltered = isSystemDocsSearchActive
        ? graphData?.nodes.filter(
            (e: any) =>
              e.type === 'system_docs' &&
              filteredSystemDocs.includes(e.category2),
          )
        : graphData?.nodes.filter((e: any) => e.type === 'system_docs');

      if (rawFiltered) {
        filteredDocs = rawFiltered.filter((doc: any) => {
          if (!seenDocuments.has(doc.category2)) {
            seenDocuments.add(doc.category2);
            return true;
          }
          return false;
        });
        totalPageSystemDocs = filteredDocs.length || 0;
      }
    } else {
      const rawFiltered = isUserUploadsSearchActive
        ? graphData?.nodes.filter(
            (e: any) =>
              e.type === 'user_docs' &&
              filteredUserUploads.includes(e.category2),
          )
        : graphData?.nodes.filter((e: any) => e.type === 'user_docs');

      if (rawFiltered) {
        filteredDocs = rawFiltered.filter((doc: any) => {
          if (!seenDocuments.has(doc.category2)) {
            seenDocuments.add(doc.category2);
            return true;
          }
          return false;
        });
        totalPageUserDocs = filteredDocs.length || 0;
      }
    }

    const itemsPerPage =
      activaTab === 'System Docs'
        ? itemsPerPageSystemDocs
        : itemsPerPageUserUploads;
    const currentPage =
      activaTab === 'System Docs'
        ? currentPageSystemDocs
        : currentPageUserUploads;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return filteredDocs.slice(startIndex, endIndex) || [];
  };

  const [searchType, setSearchType] = useState<'Docs' | 'Nodes'>('Docs');

  const [search, setSearch] = useState('');

  const handleSearch = (term: string) => {
    const searchTerm = term.toLowerCase();

    if (searchType === 'Docs') {
      if (!term.trim()) {
        setFilteredUserUploads([]);
        setFilteredSystemDocs([]);
        setIsSystemDocsSearchActive(false);
        setIsUserUploadsSearchActive(false);
        setCurrentPageUserUploads(1);
        setCurrentPageSystemDocs(1);
      } else {
        if (activaTab === 'User Uploads') {
          const filteredDocs = graphData?.nodes
            ?.filter(
              (node: any) =>
                node.type === 'user_docs' &&
                node.category2.toLowerCase().includes(searchTerm),
            )
            ?.map((node: any) => node.category2 as string);
          const filteredUserDocs = [...new Set(filteredDocs || [])] as string[];
          setFilteredUserUploads(filteredUserDocs);
          setIsUserUploadsSearchActive(true);
          setCurrentPageUserUploads(1);
        } else if (activaTab === 'System Docs' && graphData) {
          const filteredDocs = graphData.nodes
            ?.filter(
              (node: any) =>
                node.type === 'system_docs' &&
                node.category2.toLowerCase().includes(searchTerm),
            )
            ?.map((node: any) => node.category2 as string);
          const uniqueFilteredDocs = [
            ...new Set(filteredDocs || []),
          ] as string[];
          setFilteredSystemDocs(uniqueFilteredDocs);
          setIsSystemDocsSearchActive(true);
          setCurrentPageSystemDocs(1);
        }
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
  // useEffect(() => {
  //   setFilteredUserUploads(userUploads);
  // }, [userUploads]);

  // Reset filteredUserUploads when switching to User Uploads tab
  // useEffect(() => {
  //   if (activaTab === 'User Uploads') {
  //     setFilteredUserUploads(userUploads);
  //   }
  // }, [activaTab, userUploads]);

  useEffect(() => {
    getCurrentPageData();
  }, [
    filteredUserUploads,
    filteredSystemDocs,
    currentPageUserUploads,
    currentPageSystemDocs,
  ]);

  useEffect(() => {
    if (activaTab === 'System Docs') {
      // do nothing
    } else {
      setIsSystemDocsSearchActive(false);
    }
    setCurrentPageUserUploads(1);
    setCurrentPageSystemDocs(1);
  }, [activaTab]);

  // Reset search when switching tabs
  useEffect(() => {
    setSearch('');
    setFilteredUserUploads([]);
    setFilteredSystemDocs([]);
    setIsSystemDocsSearchActive(false);
    setIsUserUploadsSearchActive(false);
  }, [activaTab]);

  // Reset search when search type changes
  useEffect(() => {
    setSearch('');
    setFilteredUserUploads([]);
    setFilteredSystemDocs([]);
    setIsSystemDocsSearchActive(false);
    setIsUserUploadsSearchActive(false);
  }, [searchType]);

  // Reset search when modal opens/closes
  useEffect(() => {
    if (!showDoc) {
      setSearch('');
      setFilteredUserUploads([]);
      setFilteredSystemDocs([]);
      setIsSystemDocsSearchActive(false);
      setIsUserUploadsSearchActive(false);
    }
  }, [showDoc]);

  return (
    <ErrorBoundary>
      <AddNewDocument
        AddFileModal={AddFilleModal}
        handleGraphData={handleGraphData}
        handleActiveFilters={handleActiveFilters}
        handleAddFileModal={handleAddFilleModal}
      />
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
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <div className="flex items-center justify-center flex-col">
                  <Circleloader></Circleloader>

                  {loadProgress > 0 && (
                    <div className="mt-2 text-sm text-Text-Primary">
                      Loading graph data... {Math.round(loadProgress)}%
                      <br />
                      <span className="text-xs text-Text-Quadruple">
                        Loaded {loadedNodesCount} of {totalNodesCount} nodes
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <LoadGraph
              graphData={graphData}
              activeFilters={activeFilters}
              isInitialLoad={isInitialLoad}
              onLoadProgress={(progress, loadedCount, totalCount) => {
                setLoadProgress(progress);
                setLoadedNodesCount(loadedCount);
                setTotalNodesCount(totalCount);
              }}
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
                onSearch={(e) => {
                  handleSearch(e);
                  setSearch(e);
                }}
                value={search}
              />

              <div className="flex items-center gap-4 mt-2 text-[10px] text-Text-Primary">
                <span>Search by:</span>
                {['Docs', 'Nodes'].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="searchTypeMobile"
                      checked={searchType === type}
                      onChange={() => setSearchType(type as 'Docs' | 'Nodes')}
                      className={`w-3 h-3 rounded-full border cursor-default
            ${
              searchType === type
                ? 'border-Primary-DeepTeal bg-Primary-DeepTeal'
                : 'border-Text-Primary bg-white'
            }`}
                    />
                    {type}
                  </label>
                ))}
              </div>

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
                        </>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{ height: window.innerHeight - 70 + 'px' }}
            className=" hidden fixed right-5 top-[8%] w-[315px]  text-primary-text  md:flex flex-col "
          >
            <SearchBox
              isGrayIcon
              placeHolder="Search documents or knowledge graph nodes..."
              onSearch={(e) => {
                handleSearch(e);
                setSearch(e);
              }}
              value={search}
            />
            <div className="flex items-center gap-4 mt-2 text-[10px] text-Text-Primary">
              <span>Search by:</span>
              {['Docs', 'Nodes'].map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="searchType"
                    checked={searchType === type}
                    onChange={() => setSearchType(type as 'Docs' | 'Nodes')}
                    className={`w-3 h-3 rounded-full border cursor-default
          ${
            searchType === type
              ? 'border-Primary-DeepTeal bg-Primary-DeepTeal'
              : 'border-Text-Primary bg-white'
          }`}
                  />
                  {type}
                </label>
              ))}
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
                  disabled
                  onClick={() => setAddFilleModal(true)}
                  className={
                    'mt-3 border-dashed opacity-50 flex items-center justify-center gap-2 text-Primary-DeepTeal TextStyle-Button px-8 py-1 border bg-white rounded-2xl border-Primary-DeepTeal '
                  }
                >
                  <img className={'w-5 h-5'} src={'/icons/add-blue.svg'} />
                  Add New Document
                </button>
                <div className="mx-auto bg-white rounded-2xl pb-4 shadow-100 overflow-hidden mt-2 relative w-[315px]">
                  <div className="min-w-full bg-white">
                    <div className="bg-[#E5E5E5] flex text-xs font-medium text-Text-Primary">
                      <div className="w-[140px] text-left pl-2 py-2">
                        Node Type
                      </div>
                      <div className="w-[90px] py-2 text-center">
                        Date of Update
                      </div>
                      <div className="w-[65px] text-right py-2 ">Action</div>
                    </div>
                    {getCurrentPageData().length < 1 ? (
                      <div className="flex flex-col items-center justify-center h-full   w-[315px] text-xs text-Text-Primary">
                        <img
                          className="w-[200px] h-[161px]"
                          src="/icons/search-status.svg"
                          alt=""
                        />
                        No results found.
                      </div>
                    ) : (
                      <VirtualScrollTable
                        items={getCurrentPageData()}
                        itemHeight={40}
                        visibleItems={10}
                        renderItem={(doc, index) => (
                          <div
                            key={doc.id}
                            className={`flex items-center ${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-[#888888] border border-Gray-50 h-[40px]`}
                          >
                            <div
                              className={`pl-2 py-2 truncate max-w-[140px] w-[140px] ${!doc.status ? 'opacity-40' : ''}`}
                            >
                              {doc.category2}
                            </div>
                            <div
                              className={`px-2 py-2 w-[90px] text-center ${!doc.status ? 'opacity-40' : ''}`}
                            >
                              {doc.upload_date
                                ? new Date(doc.upload_date).toLocaleDateString(
                                    'en-GB',
                                  )
                                : 'No Date'}
                            </div>
                            <div className="py-2 pr-2 w-[80px] text-right flex items-center justify-end gap-2">
                              {confirmDeleteId === doc.id ? (
                                <div className="flex items-center gap-1 text-[10px] text-Text-Primary">
                                  Sure?
                                  <img
                                    className="cursor-pointer size-4"
                                    onClick={() => {
                                      if (isLoadingCallApi) return;
                                      handleDeleteFileUserUpload(doc.category2);
                                    }}
                                    src="/icons/confirm-tick-circle.svg"
                                    alt="Confirm"
                                  />
                                  <img
                                    className="cursor-pointer size-4"
                                    onClick={() => setConfirmDeleteId(null)}
                                    src="/icons/cansel-close-circle.svg"
                                    alt="Cancel"
                                  />
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      if (isLoadingCallApi) return;
                                      handleDownloadFileUserUpload(
                                        doc.category2,
                                      );
                                    }}
                                  >
                                    <img src="/icons/import-blue.svg" alt="" />
                                  </button>
                                  <button
                                    className='hidden'
                                    onClick={() => setConfirmDeleteId(doc.id)}
                                  >
                                    <img
                                      src="/icons/trash-blue.svg"
                                      alt="Delete"
                                    />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      />
                    )}
                  </div>
                  {getCurrentPageData().length > 0 && (
                    <div className="flex justify-center py-2 absolute bottom-0 w-full bg-white">
                      <Pagination
                        currentPage={currentPageUserUploads}
                        totalPages={Math.ceil(
                          totalPageUserDocs / itemsPerPageUserUploads,
                        )}
                        onPageChange={handlePageChangeUserUploads}
                        isEmpty={totalPageUserDocs === 0}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto bg-white rounded-2xl pb-4 shadow-100 overflow-hidden mt-2 relative w-[315px]">
                  <div className="min-w-full bg-white">
                    <div className="bg-[#E5E5E5] flex text-xs font-medium text-Text-Primary">
                      <div className="w-[140px] text-left pl-2 py-2">
                        Node Type
                      </div>
                      <div className="w-[90px] py-2 text-center">
                        Date of Update
                      </div>
                      <div className="w-[60px] py-2  text-center">Action</div>
                    </div>
                    {getCurrentPageData().length < 1 ? (
                      <div className="flex flex-col items-center justify-center h-full w-[315px] text-xs text-Text-Primary">
                        <img
                          className="w-[200px] h-[161px]"
                          src="/icons/search-status.svg"
                          alt=""
                        />
                        No results found.
                      </div>
                    ) : (
                      <VirtualScrollTable
                        items={getCurrentPageData()}
                        itemHeight={40}
                        visibleItems={10}
                        renderItem={(doc, index) => (
                          <div
                            key={doc.id}
                            className={`flex items-center ${index % 2 === 0 ? 'bg-white' : 'bg-[#F4F4F4]'} text-[10px] text-[#888888] border-b border-Gray-50 h-[40px]`}
                          >
                            <div
                              className={`pl-2 py-2 truncate max-w-[140px] w-[140px] ${!doc.status ? 'opacity-40' : ''}`}
                            >
                              {doc.category2}
                            </div>
                            <div
                              className={`px-2 py-2 w-[90px] text-center ${!doc.status ? 'opacity-40' : ''}`}
                            >
                              {doc.upload_date
                                ? new Date(doc.upload_date).toLocaleDateString(
                                    'en-GB',
                                  )
                                : 'No Date'}
                            </div>
                            <div className="py-2 pr-2 w-[80px] text-center flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  if (isLoadingCallApi) return;
                                  console.log(doc.category2);

                                  handleDownloadFileSystemDocs(doc.category2);
                                }}
                              >
                                <img src="/icons/import-blue.svg" alt="" />
                              </button>
                            </div>
                          </div>
                        )}
                      />
                    )}
                  </div>
                  {getCurrentPageData().length > 0 && (
                    <div className="py-2 flex justify-center absolute bottom-0 bg-white w-full">
                      <Pagination
                        currentPage={currentPageSystemDocs}
                        totalPages={Math.ceil(
                          totalPageSystemDocs / itemsPerPageSystemDocs,
                        )}
                        onPageChange={handlePageChangeSystemDocs}
                        isEmpty={totalPageSystemDocs === 0}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AiKnowledge;
