import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

export interface MindmapData {
  central: string;
  concepts: {
    title: string;
    subConcepts: string[];
  }[];
}

export interface Node extends ReactFlowNode {
  data: {
    label: string;
    type?: 'central' | 'main' | 'sub';
  };
  style?: React.CSSProperties;
}

export type Edge = ReactFlowEdge & {
  className?: string;
  animated?: boolean;
  type?: 'main' | 'sub' | 'smoothstep' | undefined;
};

export type BackgroundVariant = 'dots' | 'lines' | 'cross' | undefined; 