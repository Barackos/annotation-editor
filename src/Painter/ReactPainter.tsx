import { isEqual } from "lodash";
import * as PropTypes from "prop-types";
import * as React from "react";
import {
  ImageAnalyzer,
  initialize,
  rgbToString,
  findClosest,
  distance,
} from "../utils/analysis";
import loadOpenCv, { removeLoadListener } from "../utils/loadOpenCv";
import {
  ColorRgb,
  ColorSetter,
  DataStep,
  Point,
  SavedAnnotation,
} from "../utils/types";
import {
  canvasToBlob,
  composeFn,
  downloadObjectAsJson,
  fileToUrl,
  importImage,
  isCycle,
  revokeUrl,
  tryRemoveVertex,
} from "./util";

// disable touchAction, else the draw on canvas would not work
// because window would scroll instead of draw on it
const setUpForCanvas = () => {
  document.body.style.touchAction = "none";
};

const cleanUpCanvas = () => {
  document.body.style.touchAction = null;
};

export type LineJoinType = "round" | "bevel" | "miter";
export type LineCapType = "round" | "butt" | "square";

type HandleRedrawParams = Partial<
  Pick<
    PainterState,
    | "undoSteps"
    | "redoSteps"
    | "shapes"
    | "shapesRedo"
    | "currStepStartingIdx"
    | "isDrawing"
  >
>;
type HandleRedraw = (params: HandleRedrawParams) => Promise<void>;

export interface CanvasProps {
  onMouseDown: React.MouseEventHandler<HTMLCanvasElement>;
  onTouchStart: React.TouchEventHandler<HTMLCanvasElement>;
  onMouseMove: React.MouseEventHandler<HTMLCanvasElement>;
  onTouchMove: React.TouchEventHandler<HTMLCanvasElement>;
  onMouseUp: React.MouseEventHandler<HTMLCanvasElement>;
  onTouchEnd: React.TouchEventHandler<HTMLCanvasElement>;
  style: React.CSSProperties;
  ref: (ref: HTMLCanvasElement) => void;
}

export interface PropsGetterInput extends Partial<CanvasProps> {
  [key: string]: any;
}

export interface PropsGetterResult extends CanvasProps {
  [key: string]: any;
}

export interface RenderProps {
  canvas: JSX.Element;
  triggerSave: () => void;
  getCanvasProps: (props: PropsGetterInput) => PropsGetterResult;
  imageCanDownload: boolean;
  imageDownloadUrl: string;
  setColor: (colorRgb: ColorRgb) => void;
  setLineWidth: (width: number) => void;
  setLineJoin: (type: LineJoinType) => void;
  setLineCap: (type: LineCapType) => void;
}

export interface ReactPainterProps {
  height?: number;
  width?: number;
  initialColor?: ColorRgb;
  initialLineWidth?: number;
  initialLineJoin?: LineJoinType;
  initialLineCap?: LineCapType;
  isDrawable?: boolean;
  onSave?: (blob: Blob) => void;
  image?: File | Blob | string;
  render?: (props: RenderProps) => JSX.Element;
  setLoading?: (loading: boolean) => void;
}

export interface PainterState extends SavedAnnotation {
  canvasHeight: number;
  canvasWidth: number;
  imageCanDownload: boolean;
  imageDownloadUrl: string;
  isDrawing: boolean;
  colorRgb: ColorRgb;
  lineWidth: number;
  lineJoin: LineJoinType;
  lineCap: LineCapType;
  currStepStartingIdx: number;
  imgAnalyzer: ImageAnalyzer;
  shiftKey: boolean;
}

export class ReactPainter extends React.Component<
  ReactPainterProps,
  PainterState
> {
  static propTypes = {
    color: PropTypes.any,
    width: PropTypes.number,
    height: PropTypes.number,
    image: PropTypes.oneOfType([
      PropTypes.instanceOf(File),
      PropTypes.instanceOf(Blob),
      PropTypes.string,
    ]),
    lineCap: PropTypes.string,
    lineJoin: PropTypes.string,
    lineWidth: PropTypes.number,
    onSave: PropTypes.func,
    render: PropTypes.func,
    currStepStartingIdx: PropTypes.number,
    setLoading: PropTypes.func,
  };

  static defaultProps: Partial<ReactPainterProps> = {
    height: 300,
    image: undefined,
    onSave() {
      // noop
    },
    initialColor: { r: 0, g: 0, b: 0 },
    initialLineCap: "round",
    initialLineJoin: "round",
    initialLineWidth: 5,
    width: 300,
  };

  canvasRef: HTMLCanvasElement = null;
  ctx: CanvasRenderingContext2D = null;
  lastX = 0;
  lastY = 0;
  scalingFactor = 1;

  state: PainterState = {
    canvasHeight: 0,
    canvasWidth: 0,
    colorRgb: this.props.initialColor,
    imageCanDownload: null,
    imageDownloadUrl: null,
    isDrawing: false,
    lineCap: this.props.initialLineCap,
    lineJoin: this.props.initialLineJoin,
    lineWidth: this.props.initialLineWidth,
    undoSteps: [],
    redoSteps: [],
    shapes: [],
    shapesRedo: [],
    currStepStartingIdx: 0,
    shiftKey: false,
    imgAnalyzer: undefined,
  };

  extractOffSetFromEvent = (
    e: React.SyntheticEvent<HTMLCanvasElement>
  ): Point => {
    const {
      offsetX,
      offsetY,
      touches,
      clientX: mouseClientX,
      clientY: mouseClientY,
    } = e.nativeEvent as any;
    // If offset coords are directly on the event we use them
    if (offsetX && offsetY) {
      return {
        x: offsetX * this.scalingFactor,
        y: offsetY * this.scalingFactor,
      };
    }
    // Otherwise we need to calculate them themselves
    // We need to check whether user is using a touch device or just the mouse and extract
    // the touch/click coords accordingly
    const clientX =
      touches && touches.length ? touches[0].clientX : mouseClientX;
    const clientY =
      touches && touches.length ? touches[0].clientY : mouseClientY;
    const rect = this.canvasRef.getBoundingClientRect();
    const x = (clientX - rect.left) * this.scalingFactor;
    const y = (clientY - rect.top) * this.scalingFactor;
    return { x, y };
  };

  initializeCanvas = (
    width: number,
    height: number,
    imgWidth?: number,
    imgHeight?: number
  ) => {
    if (imgWidth && imgHeight) {
      const [cvWidth, cvHeight, scalingRatio] = this.getDrawImageCanvasSize(
        width,
        height,
        imgWidth,
        imgHeight
      );
      this.canvasRef.width = imgWidth;
      this.canvasRef.height = imgHeight;
      this.setState({
        canvasHeight: cvHeight,
        canvasWidth: cvWidth,
      });
      this.scalingFactor = 1 / scalingRatio;
    } else {
      this.canvasRef.width = width;
      this.canvasRef.height = height;
      this.setState({
        canvasHeight: height,
        canvasWidth: width,
      });
    }
    const { colorRgb, lineWidth, lineJoin, lineCap } = this.state;
    this.ctx = this.canvasRef.getContext("2d");
    this.ctx.strokeStyle = rgbToString(colorRgb);
    this.ctx.lineWidth = lineWidth * this.scalingFactor;
    this.ctx.lineJoin = lineJoin;
    this.ctx.lineCap = lineCap;
  };

  getDrawImageCanvasSize = (
    cWidth: number,
    cHeight: number,
    imageWidth: number,
    imageHeight: number
  ) => {
    if (imageWidth <= cWidth && imageHeight <= cHeight) {
      return [imageWidth, imageHeight, 1];
    }
    const scalingRatio = Math.min(cWidth / imageWidth, cHeight / imageHeight);
    return [
      scalingRatio * imageWidth,
      scalingRatio * imageHeight,
      scalingRatio,
    ];
  };

  findClosestVertex = (base: Point, startPoint?: Point, threshold?: number) => {
    const { imgAnalyzer } = this.state;
    if (!imgAnalyzer) return base;
    const thresh = threshold || 10;
    // Include first point as a snipping vertex
    if (startPoint && distance(base, startPoint) < thresh * 2)
      return startPoint;
    const points = imgAnalyzer.points_flattened;
    const closest = findClosest(base, points);
    if (closest.dist > thresh) return base;
    return closest.point;
  };

  handleMouseDown: CanvasProps["onMouseDown"] = (e) => {
    const mousePosition = this.extractOffSetFromEvent(e);
    if (this.props.isDrawable) {
      const { undoSteps } = this.state;
      const { x, y } = this.findClosestVertex(mousePosition);
      this.lastX = x;
      this.lastY = y;

      this.setState({
        isDrawing: true,
        currStepStartingIdx: undoSteps.length,
      });
    }
    if (e.button === 1) {
      this.removeStep(mousePosition);
    }
  };

  removeStep = (mousePosition: Point) => {
    const { undoSteps, redoSteps, shapes, shapesRedo } = this.state;
    const remover = (list: DataStep[]) => tryRemoveVertex(mousePosition, list);
    this.handleRedraw({
      undoSteps: remover(undoSteps),
      redoSteps: remover(redoSteps),
      shapes: shapes.map(remover),
      shapesRedo: shapesRedo.map(remover),
    });
  };

  draw = (lastX: number, lastY: number, x: number, y: number) => {
    const { colorRgb, lineWidth, lineCap, lineJoin, undoSteps } = this.state;
    const ctx = this.ctx;
    ctx.strokeStyle = rgbToString(colorRgb);
    ctx.lineWidth = lineWidth * this.scalingFactor;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    undoSteps.push({ x, y });
    this.setState({ undoSteps });
  };

  handleMouseMove: CanvasProps["onMouseMove"] = (e) => {
    const { isDrawing, undoSteps, shiftKey, currStepStartingIdx } = this.state;
    const mousePosition = this.extractOffSetFromEvent(e);
    if (this.props.isDrawable && isDrawing) {
      const lastX = this.lastX;
      const lastY = this.lastY;

      const { x, y } = !shiftKey
        ? this.findClosestVertex(mousePosition, undoSteps[0])
        : mousePosition;
      if (x === lastX && y === lastY) return;

      let steps = undoSteps;
      //Update undoSteps
      if (steps.length === 0) {
        steps.push({ x: lastX, y: lastY });
      }

      if (!shiftKey && !isEqual(mousePosition, { x, y })) {
        const firstSteps = steps.slice(0, currStepStartingIdx + 1);
        steps = [...firstSteps, { x, y }];
        const currIdx = steps.length;
        this.setState({ currStepStartingIdx: currIdx });
        this.handleRedraw({ undoSteps: steps, currStepStartingIdx: currIdx });
      } else {
        this.draw(lastX, lastY, x, y);
      }
      this.lastX = x;
      this.lastY = y;
    }
  };

  handleMouseUp: CanvasProps["onMouseUp"] = (e) => {
    const {
      isDrawing,
      undoSteps,
      redoSteps,
      currStepStartingIdx,
      shapes,
      shapesRedo,
    } = this.state;
    const { setLoading, isDrawable } = this.props;
    if (isDrawable) {
      let steps = undoSteps;
      let clearRedo = false;
      if (isDrawing) {
        // Edge case - if mouseDown & instant mouseUp - nothing was drawn
        if (currStepStartingIdx + 1 === undoSteps.length) steps.pop();
        else clearRedo = true;
        const firstSteps = undoSteps.slice(0, currStepStartingIdx + 1);
        steps = [...firstSteps, undoSteps[undoSteps.length - 1]];
        steps = steps.filter(
          (() => {
            let p: DataStep = { x: undefined, y: undefined };
            return (point: DataStep) => {
              const toReturn = JSON.stringify(p) !== JSON.stringify(point);
              p = point;
              return toReturn;
            };
          })()
        );
        // is new shape? deep equality check
        if (isCycle(steps)) {
          shapes.push(steps);
          steps = [];
          this.ctx.closePath();
        }
        setLoading(true);
        this.handleRedraw({
          isDrawing: false,
          undoSteps: steps,
          redoSteps: clearRedo ? [] : redoSteps,
          currStepStartingIdx: 0,
          shapes,
          shapesRedo: clearRedo ? [] : shapesRedo,
        }).then(() => setLoading(false));
      }
    }
  };

  canUndo = () => this.state.undoSteps.length > 0;
  canRedo = () => this.state.redoSteps.length > 0;

  handleUndo = () => {
    const { undoSteps, redoSteps, shapes, shapesRedo } = this.state;
    let undos = undoSteps,
      redos = redoSteps;
    if (undos.length > 0) {
      redos.push(undos.pop());
      if (undos.length === 1) {
        redos.push(undos.pop());
        shapesRedo.push(redos);
        redos = [];
      }
    } else if (shapes.length > 0) {
      undos = shapes.pop();
      redos.push(undos.pop());
    }
    this.handleRedraw({
      undoSteps: undos,
      redoSteps: redos,
      shapes,
      shapesRedo,
    });
  };

  handleRedo = () => {
    const { undoSteps, redoSteps, shapes, shapesRedo } = this.state;
    let undos = undoSteps,
      redos = redoSteps;
    if (redos.length > 0) {
      undos.push(redos.pop());
      if (isCycle(undos)) {
        shapes.push(undos);
        undos = [];
      }
    } else if (shapesRedo.length > 0) {
      redos = shapesRedo.pop();
      undos.push(redos.pop());
      undos.push(redos.pop());
    }
    this.handleRedraw({
      undoSteps: undos,
      redoSteps: redos,
      shapes,
      shapesRedo,
    });
  };

  handleRedraw: HandleRedraw = async ({
    undoSteps = this.state.undoSteps,
    redoSteps = this.state.redoSteps,
    shapes = this.state.shapes,
    shapesRedo = this.state.shapesRedo,
    currStepStartingIdx = this.state.currStepStartingIdx,
    isDrawing = this.state.isDrawing,
  }) => {
    const { width, height } = this.props;
    const ctx = this.ctx;

    // ctx.clearRect(0, 0, width, height);
    this.loadImage(this.props.image, width, height).then(() => {
      const drawSteps = (steps: DataStep[]) => {
        if (steps.length === 0) {
          return;
        }
        ctx.beginPath();
        const [firstStep, ...rest] = steps;
        ctx.moveTo(firstStep.x, firstStep.y);

        rest.forEach((step) => {
          ctx.lineTo(step.x, step.y);
        });
        ctx.stroke();
        ctx.closePath();
        ctx.save();
      };
      //Draw shapes first
      ctx.strokeStyle = rgbToString({ r: 0, g: 255, b: 0 });
      ctx.save();
      shapes.forEach(drawSteps);

      //Draw undo steps
      ctx.strokeStyle = rgbToString(this.state.colorRgb);
      drawSteps(undoSteps);
    });
    this.setState({
      undoSteps,
      redoSteps,
      shapes,
      shapesRedo,
      currStepStartingIdx,
      isDrawing,
    });
  };

  handleSaveBlob = () => {
    const { onSave } = this.props;
    canvasToBlob(this.canvasRef, "image/png")
      .then((blob: Blob) => {
        onSave(blob);
        this.setState({
          imageDownloadUrl: fileToUrl(blob),
        });
      })
      .catch((err) => console.error("in ReactPainter handleSaveBlob", err));
  };

  handleSaveAnnotation = () =>
    downloadObjectAsJson(this.getAnnotations(), "Annotation");

  getAnnotations = () => {
    const { undoSteps, redoSteps, shapes, shapesRedo } = this.state;
    return { undoSteps, redoSteps, shapes, shapesRedo };
  };

  handleLoadAnnotation = (savedAnnotation: SavedAnnotation) => {
    this.handleRedraw(savedAnnotation).then(() => {
      this.props.setLoading(false);
    });
  };

  showAnnotation = (shouldAssist: boolean) => {
    // let dst = new opencv.Mat();
    // opencv.cvtColor(src, src, opencv.COLOR_RGB2GRAY, 0);
    // let ksize = new opencv.Size(3, 3);
    // let anchor = new opencv.Point(-1, -1);
    // // You can try more different parameters
    // opencv.blur(src, src, ksize, anchor, opencv.BORDER_DEFAULT);
    // opencv.threshold(src, sr, 177, 200, opencv.THRESH_BINARY);
    // opencv.Canny(src, dst, 50, 100, 3, false);
    // opencv.imshow("canvasInput", dst);
    // src.delete();
    // dst.delete();

    const { imgAnalyzer, undoSteps } = this.state;
    if (shouldAssist) imgAnalyzer?.drawContours();
    else {
      this.handleRedraw({ undoSteps });
    }
  };

  handleSetColor: ColorSetter = async (colorRgb) =>
    this.setState({
      colorRgb,
    });

  handleSetLineWidth = (lineWidth: number) =>
    this.setState({
      lineWidth,
    });

  handleSetLineJoin = (type: "round" | "bevel" | "miter") =>
    this.setState({
      lineJoin: type,
    });

  handleSetLineCap = (type: "round" | "butt" | "square") =>
    this.setState({
      lineCap: type,
    });

  getCanvasProps = (props: PropsGetterInput = {}): PropsGetterResult => {
    const {
      onMouseDown,
      onTouchStart,
      onMouseMove,
      onTouchMove,
      onMouseUp,
      onTouchEnd,
      style,
      ref,
      ...restProps
    } = props;
    return {
      onMouseDown: composeFn(onMouseDown, this.handleMouseDown),
      onMouseMove: composeFn(onMouseMove, this.handleMouseMove),
      onMouseUp: composeFn(onMouseUp, this.handleMouseUp),
      onTouchEnd: composeFn(onTouchEnd, this.handleMouseUp),
      onTouchMove: composeFn(onTouchMove, this.handleMouseMove),
      onTouchStart: composeFn(onTouchStart, this.handleMouseDown),
      ref: composeFn(ref, (canvasRef: HTMLCanvasElement) => {
        this.canvasRef = canvasRef;
      }),
      style: {
        height: this.state.canvasHeight,
        width: this.state.canvasWidth,
        ...style,
      },
      ...restProps,
    };
  };

  loadImage = (image: File | Blob | string, width: number, height: number) =>
    importImage(image)
      .then(({ img, imgWidth, imgHeight }) => {
        this.initializeCanvas(width, height, imgWidth, imgHeight);
        this.ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
        this.setState({
          imageCanDownload: true,
        });
      })
      .catch((err) => {
        this.setState({
          imageCanDownload: false,
        });
        this.initializeCanvas(width, height);
      });

  keyDown: GlobalEventHandlers["onkeydown"] = (e) => {
    const { key, shiftKey, ctrlKey, metaKey } = e;
    if (key.toLowerCase() === "z" && (ctrlKey || metaKey)) {
      if (shiftKey) this.handleRedo();
      else this.handleUndo();
    }
    this.setState({ shiftKey });
  };

  keyUp: GlobalEventHandlers["onkeyup"] = ({ shiftKey }) =>
    this.setState({ shiftKey });

  initImageAnalyser = (cv: any) => {
    const init = () => {
      const imgAnalyzer = initialize("canvasInput", cv, this.handleSetColor);
      this.setState({ imgAnalyzer });
      // (async () => this.showAnnotation(true))();
    };
    setTimeout(init, 300);
  };

  componentDidMount() {
    const { width, height, image } = this.props;
    setUpForCanvas();
    if (image) {
      this.loadImage(image, width, height).then(() => {
        loadOpenCv(this.initImageAnalyser);
      });
    } else {
      this.initializeCanvas(width, height);
    }
    document.addEventListener("keydown", this.keyDown);
    document.addEventListener("keyup", this.keyUp);
  }

  componentWillUnmount() {
    cleanUpCanvas();
    revokeUrl(this.state.imageDownloadUrl);
    document.removeEventListener("keydown", this.keyDown);
    document.removeEventListener("keyup", this.keyDown);
    removeLoadListener(this.initImageAnalyser);
    this.state.imgAnalyzer?.destroy();
  }

  render() {
    const { render } = this.props;
    const { imageCanDownload, imageDownloadUrl } = this.state;
    const canvasNode = <canvas id="canvasInput" {...this.getCanvasProps()} />;
    return typeof render === "function"
      ? render({
          canvas: canvasNode,
          getCanvasProps: this.getCanvasProps,
          imageCanDownload,
          imageDownloadUrl,
          setColor: this.handleSetColor,
          setLineCap: this.handleSetLineCap,
          setLineJoin: this.handleSetLineJoin,
          setLineWidth: this.handleSetLineWidth,
          triggerSave: this.handleSaveBlob,
        })
      : canvasNode;
  }
}
