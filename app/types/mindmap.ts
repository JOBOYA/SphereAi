import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

export interface Node extends ReactFlowNode {
  style?: React.CSSProperties;
}

export type Edge = ReactFlowEdge & {
  className?: string;
  animated?: boolean;
};

export type BackgroundVariant = 'dots' | 'lines' | undefined; 