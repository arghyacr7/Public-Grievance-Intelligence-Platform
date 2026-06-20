import React, { useRef, useEffect } from 'react';

export default function AnnotatedImage({ src, detections }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      if (detections && detections.length > 0) {
        const boxColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"];
        detections.forEach((det, index) => {
          let bbox;
          try {
            bbox = JSON.parse(det.bbox_json);
          } catch(e) { return; }
          
          const [x1, y1, x2, y2] = bbox;
          const width = Math.max(0, x2 - x1);
          const height = Math.max(0, y2 - y1);
          const color = boxColors[index % boxColors.length];
          const scaleFactor = Math.max(1, canvas.width / 900);
          const lineWidth = Math.max(3, 4 * scaleFactor);
          const fontSize = Math.max(16, 20 * scaleFactor);
          const label = `${det.class_name} (${Math.round(det.confidence * 100)}%)`;

          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.strokeRect(x1, y1, width, height);

          ctx.font = `700 ${fontSize}px Inter, sans-serif`;
          const labelPaddingX = 10 * scaleFactor;
          const labelPaddingY = 6 * scaleFactor;
          const labelWidth = ctx.measureText(label).width + labelPaddingX * 2;
          const labelHeight = fontSize + labelPaddingY * 2;
          const labelX = Math.max(0, Math.min(x1 - lineWidth / 2, canvas.width - labelWidth));
          const labelY = y1 - labelHeight - lineWidth > 0 ? y1 - labelHeight - lineWidth : y1 + lineWidth;

          ctx.fillStyle = color;
          ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(label, labelX + labelPaddingX, labelY + labelPaddingY + fontSize * 0.82);
        });
      }
    };
    img.src = src;
  }, [src, detections]);

  return (
    <div style={{ width: '100%', overflow: 'hidden', borderRadius: '8px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }}></canvas>
    </div>
  );
}
