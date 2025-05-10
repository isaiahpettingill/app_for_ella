declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css';

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  import { ComponentChildren, FunctionComponent, JSX } from 'preact';
  interface SVGProps extends JSX.SVGAttributes<SVGSVGElement> {
    children?: ComponentChildren;
    class?: string;
  }
  const value: FunctionComponent<SVGProps>;
  export default value;
} 