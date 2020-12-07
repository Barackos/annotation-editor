import * as PropTypes from 'prop-types';
import * as React from 'react';
import { canvasToBlob, composeFn, downloadObjectAsJson, fileToUrl, importImage, revokeUrl } from './util';

// disable touchAction, else the draw on canvas would not work
// because window would scroll instead of draw on it
const setUpForCanvas = () => {
  document.body.style.touchAction = 'none';
};

const cleanUpCanvas = () => {
  document.body.style.touchAction = null;
};

export type LineJoinType = 'round' | 'bevel' | 'miter';
export type LineCapType = 'round' | 'butt' | 'square';

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
  setColor: (color: string) => void;
  setLineWidth: (width: number) => void;
  setLineJoin: (type: LineJoinType) => void;
  setLineCap: (type: LineCapType) => void;
}

export interface ReactPainterProps {
  height?: number;
  width?: number;
  initialColor?: string;
  initialLineWidth?: number;
  initialLineJoin?: LineJoinType;
  initialLineCap?: LineCapType;
  isDrawable?: boolean;
  onSave?: (blob: Blob) => void;
  image?: File | string;
  render?: (props: RenderProps) => JSX.Element;
}
interface DataStep {
  x: number;
  y: number;
}

export interface PainterState {
  canvasHeight: number;
  canvasWidth: number;
  imageCanDownload: boolean;
  imageDownloadUrl: string;
  isDrawing: boolean;
  color: string;
  lineWidth: number;
  lineJoin: LineJoinType;
  lineCap: LineCapType;
  undoSteps: DataStep[];
  redoSteps: DataStep[];
  currStepStartingIdx: number;
}

export class ReactPainter extends React.Component<ReactPainterProps, PainterState> {
  static propTypes = {
    color: PropTypes.string,
    height: PropTypes.number,
    image: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.string]),
    lineCap: PropTypes.string,
    lineJoin: PropTypes.string,
    lineWidth: PropTypes.number,
    onSave: PropTypes.func,
    render: PropTypes.func,
    width: PropTypes.number,
    undoSteps: PropTypes.arrayOf(PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })),
    redoSteps: PropTypes.arrayOf(PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })),
    currStepStartingIdx: PropTypes.number,
  };

  static defaultProps: Partial<ReactPainterProps> = {
    height: 300,
    image: undefined,
    onSave() {
      // noop
    },
    initialColor: '#000',
    initialLineCap: 'round',
    initialLineJoin: 'round',
    initialLineWidth: 5,
    width: 300
  };

  canvasRef: HTMLCanvasElement = null;
  ctx: CanvasRenderingContext2D = null;
  lastX = 0;
  lastY = 0;
  scalingFactor = 1;

  state: PainterState = {
    canvasHeight: 0,
    canvasWidth: 0,
    color: this.props.initialColor,
    imageCanDownload: null,
    imageDownloadUrl: null,
    isDrawing: false,
    lineCap: this.props.initialLineCap,
    lineJoin: this.props.initialLineJoin,
    lineWidth: this.props.initialLineWidth,
    undoSteps: [],
    redoSteps: [],
    currStepStartingIdx: 0,
  };

  extractOffSetFromEvent = (e: React.SyntheticEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY, touches, clientX: mouseClientX, clientY: mouseClientY } = e.nativeEvent as any;
    // If offset coords are directly on the event we use them
    if (offsetX && offsetY) {
      return {
        offsetX: offsetX * this.scalingFactor,
        offsetY: offsetY * this.scalingFactor
      };
    }
    // Otherwise we need to calculate them themselves
    // We need to check whether user is using a touch device or just the mouse and extract
    // the touch/click coords accordingly
    const clientX = touches && touches.length ? touches[0].clientX : mouseClientX;
    const clientY = touches && touches.length ? touches[0].clientY : mouseClientY;
    const rect = this.canvasRef.getBoundingClientRect();
    const x = (clientX - rect.left) * this.scalingFactor;
    const y = (clientY - rect.top) * this.scalingFactor;
    return {
      offsetX: x,
      offsetY: y
    };
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
        canvasWidth: cvWidth
      });
      this.scalingFactor = 1 / scalingRatio;
    } else {
      this.canvasRef.width = width;
      this.canvasRef.height = height;
      this.setState({
        canvasHeight: height,
        canvasWidth: width
      });
    }
    const { color, lineWidth, lineJoin, lineCap } = this.state;
    this.ctx = this.canvasRef.getContext('2d');
    this.ctx.strokeStyle = color;
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
    if (imageWidth <= cWidth) {
      return [imageWidth, imageHeight, 1];
    }
    const scalingRatio = cWidth / imageWidth;
    return [cWidth, scalingRatio * imageHeight, scalingRatio];
  };

  handleMouseDown = (e: React.SyntheticEvent<HTMLCanvasElement>) => {
    if(this.props.isDrawable) {
      const { offsetX, offsetY } = this.extractOffSetFromEvent(e);
      const { undoSteps } = this.state;
      this.lastX = offsetX;
      this.lastY = offsetY;

      const currStepStartingIdx = undoSteps.push({ x: this.lastX, y: this.lastY }) - 1;
      this.setState({
        isDrawing: true,
        currStepStartingIdx,
      });
    }
  };

  draw = (lastX: number, lastY: number, newX: number, newY: number) => {
    const { color, lineWidth, lineCap, lineJoin, undoSteps } = this.state;
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth * this.scalingFactor;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(newX, newY);
    ctx.stroke();
    this.lastX = newX;
    this.lastY = newY;
    
    //Update undoSteps
    if (undoSteps.length === 0) {
      undoSteps.push({ x: lastX, y: lastY });
    }
    undoSteps.push({ x: newX, y: newY });
    this.setState({ undoSteps });
  }

  handleMouseMove = (e: React.SyntheticEvent<HTMLCanvasElement>) => {
    const { isDrawing } = this.state;
    if (this.props.isDrawable && isDrawing) {
      const { offsetX, offsetY } = this.extractOffSetFromEvent(e);
      const lastX = this.lastX;
      const lastY = this.lastY;
      this.draw(lastX, lastY, offsetX, offsetY);
    }
  };

  handleMouseUp = (e: React.SyntheticEvent<HTMLCanvasElement>) => {
    const { isDrawing, undoSteps, redoSteps, currStepStartingIdx } = this.state;
    if (this.props.isDrawable) {
      let steps = undoSteps;
      let clearRedo = false;
      if (isDrawing) {
        // Edge case - if mouseDown & instant mouseUp - nothing was drawn
        if (currStepStartingIdx + 1 === undoSteps.length)
          steps.pop();
        else
          clearRedo = true;
        const firstSteps = undoSteps.slice(0, currStepStartingIdx || 1);
        steps = [ ...firstSteps, undoSteps[undoSteps.length - 1]];
        this.handleRedraw(steps);
        this.setState({
          isDrawing: false,
          undoSteps: steps,
          redoSteps: clearRedo ? [] : redoSteps,
          currStepStartingIdx: 0,
        });
      }
    }
  };

  canUndo = () => this.state.undoSteps.length > 0;
  canRedo = () => this.state.redoSteps.length > 0;

  handleUndo = () => {
    const { undoSteps, redoSteps } = this.state;
    if (undoSteps.length > 0) {
      redoSteps.push(undoSteps.pop());
      if(undoSteps.length === 1)
        redoSteps.push(undoSteps.pop());
      this.handleRedraw(undoSteps);
    }

    this.setState({
      undoSteps,
    });
  }

  handleRedo = () => {
    const { undoSteps, redoSteps } = this.state;
    if (redoSteps.length === 0) return;

    const { x: prevX, y: prevY } = undoSteps.length > 0 ? undoSteps[undoSteps.length - 1] : redoSteps.pop();
    const { x, y } = redoSteps.pop();

    this.draw(prevX, prevY, x, y);

    this.setState({
      redoSteps,
    });
  }

  handleRedraw = (undoSteps: DataStep[]) => {
    const { width, height } = this.canvasRef;
    const ratio = width / 1280.0;
    const ctx = this.ctx;
    
    // ctx.clearRect(0, 0, width, height);
    this.loadImage(this.props.image, 1280, height / ratio).then(() => {
      if(undoSteps.length === 0){return;}
      ctx.beginPath();
      const [firstStep, ...rest] = undoSteps;
      ctx.moveTo(firstStep.x, firstStep.y);
  
      rest.forEach(step => {
        ctx.lineTo(step.x, step.y);
      })
      ctx.stroke();
    });
  }

  handleSaveBlob = () => {
    const { onSave } = this.props;
    canvasToBlob(this.canvasRef, 'image/png')
      .then((blob: Blob) => {
        onSave(blob);
        this.setState({
          imageDownloadUrl: fileToUrl(blob)
        });
      })
      .catch(err => console.error('in ReactPainter handleSaveBlob', err));
  };

  handleSave = () => {
    const { undoSteps } = this.state;
    downloadObjectAsJson(undoSteps, "Annotation");
  };

  handleLoad = () => {
    
  };

  handleSetColor = (color: string) => {
    this.setState({
      color
    });
  };

  handleSetLineWidth = (lineWidth: number) => {
    this.setState({
      lineWidth
    });
  };

  handleSetLineJoin = (type: 'round' | 'bevel' | 'miter') => {
    this.setState({
      lineJoin: type
    });
  };

  handleSetLineCap = (type: 'round' | 'butt' | 'square') => {
    this.setState({
      lineCap: type
    });
  };

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
        ...style
      },
      ...restProps
    };
  };

  loadImage = (image: string | File, width: number, height: number) => 
    importImage(image)
      .then(({ img, imgWidth, imgHeight }) => {
        this.initializeCanvas(width, height, imgWidth, imgHeight);
        this.ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
        this.setState({
          imageCanDownload: true
        });
      })
      .catch(err => {
        this.setState({
          imageCanDownload: false
        });
        this.initializeCanvas(width, height);
      });

  componentDidMount() {
    const { width, height, image } = this.props;
    setUpForCanvas();
    if (image) {
      this.loadImage(image, width, height);
    } else {
      this.initializeCanvas(width, height);
    }
  }

  componentWillUnmount() {
    cleanUpCanvas();
    revokeUrl(this.state.imageDownloadUrl);
  }

  render() {
    const { render } = this.props;
    const { imageCanDownload, imageDownloadUrl } = this.state;
    const canvasNode = <canvas {...this.getCanvasProps()} />;
    return typeof render === 'function'
      ? render({
          canvas: canvasNode,
          getCanvasProps: this.getCanvasProps,
          imageCanDownload,
          imageDownloadUrl,
          setColor: this.handleSetColor,
          setLineCap: this.handleSetLineCap,
          setLineJoin: this.handleSetLineJoin,
          setLineWidth: this.handleSetLineWidth,
          triggerSave: this.handleSaveBlob
        })
      : canvasNode;
  }
}
