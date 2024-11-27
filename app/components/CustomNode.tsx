import { Handle, Position } from 'reactflow';

interface CustomNodeProps {
  data: {
    label: string;
    className?: string;
  };
}

export function CustomNode({ data }: CustomNodeProps) {
  const getNodeClass = () => {
    switch (data.className) {
      case 'central-node':
        return 'bg-blue-500 text-white font-semibold';
      case 'main-concept-node':
        return 'bg-white text-gray-900';
      case 'sub-concept-node':
        return 'bg-white text-gray-600';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className={`
      relative
      w-[250px]
      p-4
      rounded-lg
      border border-gray-200
      shadow-sm
      transition-all duration-200
      hover:shadow
      ${getNodeClass()}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-gray-300 !border !border-white !rounded-full 
                  !-left-3 !-translate-y-1/2 !top-1/2"
      />
      <div className="text-sm font-medium text-center">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-gray-300 !border !border-white !rounded-full 
                  !-right-3 !-translate-y-1/2 !top-1/2"
      />
    </div>
  );
} 