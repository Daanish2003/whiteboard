"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs"

type ElementType = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: Tools;
  roughElement: any;
}

enum Tools {
  Selection = "selection",
  Line = "line",
  Rectangle = "rectangle",
  Ellipse = "ellipse",
}

export default function DrawingTools() {
  const [elements, setElements] = useState<ElementType[]>([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState<Tools>(Tools.Line);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gen = rough.generator();

  const createElement = (x1: number, y1: number, x2: number, y2: number, type: Tools): ElementType => {
    const roughElement = type === Tools.Line
      ? gen.line(x1, y1, x2, y2)
      : gen.rectangle(x1, y1, x2 - x1, y2 - y1);
    return { x1, y1, x2, y2, type, roughElement };
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
    if (tool === Tools.Selection){
      /*
         TODO: implement selection
         if we are on an element
         setAction("moving"); 
      */

    } else {
      setAction("drawing");
    const { clientX, clientY } = event;
    const element = createElement(clientX, clientY, clientX, clientY, tool);
    setElements((prevElements) => [...prevElements, element]);
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (action === "drawing") {
      const index = elements.length - 1;
      const { clientX, clientY } = event;
      const { x1, y1 } = elements[index];
      const updateElement = createElement(x1, y1, clientX, clientY, tool);

      const elementsCopy = [...elements];
      elementsCopy[index] = updateElement;
      setElements(elementsCopy);
    }
  };

  const handleMouseUp = () => {
    setAction("none");
  }
  

   return (
    <div>
      <div className="fixed">
        <button onClick={() => setElements([])}>
          Clear
        </button>
        <input
          type="radio"
          name="selection"
          id="selection"
          checked={tool === Tools.Selection}
          onChange={() => setTool(Tools.Selection)}
        />
        <label htmlFor="selection">selection</label>

        <input
          type="radio"
          name="line"
          id="line"
          checked={tool === Tools.Line}
          onChange={() => setTool(Tools.Line)}
        />
        <label htmlFor="line">line</label>

        <input
          type="radio"
          name="rectangle"
          id="rectangle"
          checked={tool === Tools.Rectangle}
          onChange={() => setTool(Tools.Rectangle)}
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