"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs"

type ElementType = {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: Tools;
  roughElement: any;
  offsetX?: number;
  offsetY?: number;
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
  const [selectedElement, setSelectedElement]  = useState<ElementType | null>();
  const gen = rough.generator();

  const createElement = (id:number, x1: number, y1: number, x2: number, y2: number, type: Tools): ElementType => {
    const roughElement = type === Tools.Line
      ? gen.line(x1, y1, x2, y2)
      : gen.rectangle(x1, y1, x2 - x1, y2 - y1);
    return { id, x1, y1, x2, y2, type, roughElement };
  }

  type Point = {x: number, y: number}

  const distance = (a: Point, b: Point) =>
    Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const isWithinElement = (x: number, y: number, element: ElementType) => {
    const { type, x1, y1, x2, y2 } = element;

    if (type === Tools.Rectangle) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    } else {
      const a = { x: x1, y: y1 };
      const b = { x: x2, y: y2 };
      const c = { x, y };
      const offset = distance(a, b) - (distance(a, c) + distance(b, c));
      return Math.abs(offset) < 1;
    }
  };

  const getElementAtPosition = (x:number, y:number, elements: ElementType[]) => {
    return elements.find((element) => isWithinElement(x, y, element));
  };

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
  }, [elements]);

  const updateElement = (
    id: number, 
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number, 
    type:Tools
    ) => {
    const updateElement = createElement(id, x1, y1, x2, y2, type);

    const elementsCopy = [...elements];
      elementsCopy[id] = updateElement;
      setElements(elementsCopy);
  }
  
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;
    if (tool === Tools.Selection){
       const element = getElementAtPosition(clientX, clientY, elements);
         if (element){
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
          setAction("moving");
         }
    } else {
      const id = elements.length;
      const element = createElement(id, clientX, clientY, clientX, clientY, tool);
      setElements((prevElements) => [...prevElements, element]);
      setAction("drawing")
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;
    if (tool === Tools.Selection) {
        (event.target as HTMLElement).style.cursor = getElementAtPosition(clientX, clientY, elements) ? "move" : "default";
    }
    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
        updateElement(index, x1, y1, clientX, clientY, tool);

    } else if (action === "moving" && selectedElement) {
      const {id, x1, x2, y1, y2, type, offsetX, offsetY} = selectedElement;
         const  safeOffsetX = offsetX ?? 0;
         const  safeOffsetY = offsetY ?? 0;
         const newX1 = clientX - safeOffsetX;
         const newY1 = clientY- safeOffsetY
         const newX2 = newX1 + (x2 - x1);
         const newY2 = newY1 + (y2 - y1);

         updateElement(id, newX1, newY1, newX2, newY2, type);
  };

  }
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
