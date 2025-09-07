declare module 'compression' {
  function compression(): any;
  export = compression;
}

declare module 'helmet' {
  function helmet(): any;
  export = helmet;
}

declare module 'morgan' {
  function morgan(format: string, options?: any): any;
  export = morgan;
}