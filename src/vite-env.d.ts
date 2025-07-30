/// <reference types="vite/client" />

declare module '*.csv?url' {
    const content: string;
    export default content;
} 