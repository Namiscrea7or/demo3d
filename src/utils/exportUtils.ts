import pako from 'pako';
import type { Phase, EnvironmentState } from '@/types';

export const prepareDataForPreview = (phases: Phase[], environment: EnvironmentState) => {
  const serializablePhases = phases.map(phase => ({
    ...phase,
    subSteps: phase.subSteps.map(subStep => {
      const serializableTransforms = Object.entries(subStep.transforms).reduce((acc, [key, transform]) => {
        acc[key] = {
          position: transform.position.toArray(),
          quaternion: transform.quaternion.toArray(),
          scale: transform.scale.toArray(),
        };
        return acc;
      }, {} as Record<string, any>);
      
      let serializableCameraState;
      if (subStep.cameraState) {
        serializableCameraState = {
          position: subStep.cameraState.position.toArray(),
          target: subStep.cameraState.target.toArray(),
        };
      }

      return { 
        id: subStep.id,
        thumbnail: subStep.thumbnail,
        visibility: subStep.visibility,
        transforms: serializableTransforms,
        cameraState: serializableCameraState,
      };
    }),
  }));

  return { environment, animationData: serializablePhases };
};

export const exportAndCompressAnimation = (phases: Phase[], environment: EnvironmentState) => {
  if (phases.length === 0) {
    alert("Không có dữ liệu để export.");
    return;
  }
  
  const dataToExport = prepareDataForPreview(phases, environment);

  try {
    const jsonString = JSON.stringify(dataToExport);
    const compressedData = pako.gzip(jsonString);

    const blob = new Blob([compressedData], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation_data.json.gz';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Lỗi khi export và nén file:", error);
    alert("Đã có lỗi xảy ra khi export file. Vui lòng kiểm tra console.");
  }
};