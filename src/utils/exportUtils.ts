import pako from 'pako';
import type { Phase } from '@/types';

export const prepareDataForPreview = (phases: Phase[]) => {
  const serializablePhases = phases.map(phase => ({
    ...phase,
    subSteps: phase.subSteps.map(subStep => {
      const { transformHistory, ...restOfSubStep } = subStep;
      
      const serializableTransforms = Object.entries(restOfSubStep.transforms).reduce((acc, [key, transform]) => {
        acc[key] = {
          position: transform.position.toArray(),
          quaternion: transform.quaternion.toArray(),
          scale: transform.scale.toArray(),
        };
        return acc;
      }, {} as Record<string, any>);

      return { ...restOfSubStep, transforms: serializableTransforms };
    }),
  }));

  return { animationData: serializablePhases };
};

export const exportAndCompressAnimation = (phases: Phase[]) => {
  if (phases.length === 0) {
    alert("No data to export.");
    return;
  }
  
  const dataToExport = prepareDataForPreview(phases);

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
    console.error("Error to export and zip file", error);
    alert("Errỏ, check console.");
  }
};