import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

export interface MindmapData {
  central: string;
  concepts: {
    title: string;
    subConcepts: string[];
  }[];
}

export type Node = {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    type?: 'main' | 'sub' | 'leaf';
  };
} & Omit<ReactFlowNode, 'id' | 'type' | 'position' | 'data'>;

export type Edge = ReactFlowEdge & {
  animated?: boolean;
}

export interface Concept {
  id: string;
  label: string;
  level: number;
}

export interface Connection {
  source: number;
  target: number;
}

export type BackgroundVariant = 'dots' | 'lines' | 'cross' | undefined; 