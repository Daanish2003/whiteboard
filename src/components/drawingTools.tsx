"use client"
import { useLayoutEffect, useRef } from "react";
import rough from "roughjs"

export default function DrawingTools() {
  const gen = rough.generator();

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const rc = rough.canvas(canvas);
    const rectangle = gen.rectangle(10, 10, 200, 200);
    const line = gen.line(80, 130, 300, 100);
    rc.draw(rectangle);
    rc.draw(line)
  })
  
  

  return (
    <div className="flex items-center justify-center h-screen w-screen">
    <canvas
      id="canvas"
      width={750}
      height={750}
    >
      canvas
    </canvas>
    </div>
  )
} 