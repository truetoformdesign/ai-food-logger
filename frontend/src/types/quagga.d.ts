declare module 'quagga' {
  interface QuaggaConfig {
    inputStream: {
      name: string;
      type: string;
      target: HTMLElement;
      constraints: {
        width: number;
        height: number;
        facingMode: 'environment' | 'user';
      };
    };
    locator: {
      patchSize: string;
      halfSample: boolean;
    };
    numOfWorkers: number;
    frequency: number;
    decoder: {
      readers: string[];
    };
    locate: boolean;
  }

  interface QuaggaResult {
    codeResult: {
      code: string;
      format: string;
    };
    line: any;
    box: any;
    boxes: any[];
  }

  interface QuaggaStatic {
    init(config: QuaggaConfig, callback: (err?: any) => void): void;
    start(): void;
    stop(): void;
    onDetected(callback: (result: QuaggaResult) => void): void;
    onProcessed(callback: (result: QuaggaResult) => void): void;
    canvas: {
      ctx: {
        overlay: CanvasRenderingContext2D;
      };
      dom: {
        overlay: HTMLCanvasElement;
      };
    };
    ImageDebug: {
      drawPath(box: any, path: any, ctx: CanvasRenderingContext2D, options: any): void;
    };
  }

  const Quagga: QuaggaStatic;
  export default Quagga;
}
