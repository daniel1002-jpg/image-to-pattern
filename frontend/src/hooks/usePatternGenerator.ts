import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { PatternData } from '../utils/exportHelpers';

const getApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return envBaseUrl ? envBaseUrl.replace(/\/$/, '') : 'http://127.0.0.1:8000';
};

export function usePatternGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pattern, setPattern] = useState<PatternData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(50);
  const [nColors, setNColors] = useState(5);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPattern(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setPattern(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('width', width.toString());
    formData.append('n_colors', nColors.toString());

    try {
      const response = await fetch(`${getApiBaseUrl()}/process-image/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPattern(data);
    } catch (error) {
      console.error(error);
      alert('Error al procesar. Revisa que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedFile,
    pattern,
    isLoading,
    width,
    nColors,
    setWidth,
    setNColors,
    handleFileChange,
    handleGenerate,
  };
}
