export type Slide = {
  name?: string;
  content?: string;
  notes?: string[];
  html?: string;
  _fileHandle?: any;
};

export type SlideSelectionHandler = (index: number) => void;

