"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs"

type ElementType = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughElement: any;
}

export default function DrawingTools() {
  const [elements, setElements] = useState<ElementType[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [elementType, setElementType] = useState<
    "line" | "rectangle" | "circle"
  >("line");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gen = rough.generator();

  const createElement = (x1: number, y1: number, x2: number, y2: number): ElementType => {
    const roughElement = elementType === "line"
      ? gen.line(x1, y1, x2, y2)
      : gen.rectangle(x1, y1, x2 - x1, y2 - y1);
    return { x1, y1, x2, y2, roughElement };
  }

  useEffect(() => {
    if (!canvasRef.current) return;
    if (window) { // Check if window is defined
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  }, []);

  useLayoutEffect(() => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);
    
    elements.forEach(({ roughElement }) => {
      rc.draw(roughElement);
    });
  }, [elements])
  
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const { clientX, clientY } = event;
    const element = createElement(clientX, clientY, clientX, clientY);
    setElements((prevElements) => [...prevElements, element]);
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const index = elements.length - 1;
    const { clientX, clientY } = event;
    const {x1, y1} = elements[index];
    const updatedElement = createElement(x1, y1, clientX, clientY);

    const elementCopy = [...elements];
    elementCopy[index] = updatedElement;
    setElements(elementCopy);
  };

  const handleMouseUp = () => {
    setDrawing(false);
  }
  

   return (
    <div>
      <div className="fixed">
        <button onClick={() => setElements([])}>
          Clear
        </button>
        <input
          type="radio"
          name="line"
          id="line"
          checked={elementType === "line"}
          onChange={() => setElementType("line")}
        />
        <label htmlFor="line">line</label>

        <input
          type="radio"
          name="rectangle"
          id="rectangle"
          checked={elementType === "rectangle"}
          onChange={() => setElementType("rectangle")}
        />

        <label htmlFor="rectangle">rectangle</label>
      </div>
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        Canvas{" "}
      </canvas>
    </div>
  );
} 