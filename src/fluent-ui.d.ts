import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'fluent-slider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: any;
        min?: string;
        max?: string;
        value?: string;
        step?: string;
        orientation?: 'horizontal' | 'vertical';
      };
      'fluent-slider-label': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        position?: string;
      };
      'fluent-switch': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        checked?: boolean;
        disabled?: boolean;
      };
    }
  }
}
