import React, { useEffect, useRef, useState } from 'react';
import JoditEditor from 'jodit-react';
import { RichTextEditorProps } from '@/interfaces';


const RichtTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, data=null}) => {
  const editor = useRef(null); 
  const [content, setContent] = useState(value); 

  const config = {
    readonly: false, 
    height: 400, 
    placeholder:'......'
  };

  useEffect(()=>{
    setContent(value);
    console.log(value);
  },[value])

  return (
    <div>
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        onBlur={(newContent) => {
          setContent(newContent);
          onChange && onChange(newContent, data);
        }} 
        // onChange={(newContent) => {
        //   setContent(newContent); 
        // }}
      />
    </div>
  );
};

export default RichtTextEditor;
