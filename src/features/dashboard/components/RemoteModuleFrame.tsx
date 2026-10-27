import { useRef } from 'react';
import type { ModuleDefinition } from '@/modules/registry';
import { useIframeBridge } from '../hooks/useIframeBridge';

export interface RemoteModuleFrameProps {
  module: ModuleDefinition;
}

export function RemoteModuleFrame({ module }: RemoteModuleFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { handleLoad } = useIframeBridge(iframeRef);

  return (
    <iframe
      key={module.id}
      ref={iframeRef}
      src={module.url}
      title={`Módulo ${module.label}`}
      sandbox="allow-scripts allow-same-origin allow-forms"
      className="h-[calc(100vh-240px)] w-full border-0"
      onLoad={handleLoad}
    />
  );
}
