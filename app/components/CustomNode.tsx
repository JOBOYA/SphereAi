import { Handle, Position } from 'reactflow';

export function CustomNode({ data }: { data: any }) {
  return (
    <div className="relative group">
      <div className={`
        px-4 py-2.5
        bg-white 
        rounded-lg
        shadow-sm 
        border border-gray-100
        transition-all
        hover:shadow-md
        min-w-[180px]
        cursor-grab active:cursor-grabbing
      `}>
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-white !border-2 !border-indigo-200 hover:!border-indigo-400 transition-colors"
        />
        <div className="flex items-center gap-2">
          <div className={`
            w-1 h-4 rounded-sm
            ${data.type === 'main' ? 'bg-blue-500' : 
              data.type === 'sub' ? 'bg-indigo-400' : 'bg-violet-400'}
          `} />
          <div className="text-sm font-medium text-gray-800">
            {data.label}
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-white !border-2 !border-indigo-200 hover:!border-indigo-400 transition-colors"
        />
      </div>
    </div>
  );
} 