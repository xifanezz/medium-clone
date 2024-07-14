import { useLocation } from "react-router-dom";
import { PublishBar } from "../component/PublishBar";
import  Tiptap  from "../component/Tiptap";
import { Editor } from '@tiptap/core';
import { useState } from 'react';


export function Publish():JSX.Element {

    const [title, setTitle] = useState<string>("");
    //Initializing the editor in a state , so that it can be used in the Tiptap.tsx & PublishBar.tsx 
    // This is also the description of the article
    const [editor, setEditor] = useState<Editor | null>(null);
    const location = useLocation();
    const initials = location.state.name;

    const handleSave = () => {
        if (editor) {
          const html = editor.getHTML();
          console.log(html);
          // Send to backend here
          console.log(title);
        }

        else {
            console.log("Editor is null");
          }
      };
   
   

    return (<div className="p-4 mx-40">
        <PublishBar name={initials} onPublish={handleSave} />

        <div className="mx-36">
            {/* Title */}
            <textarea  placeholder="Title" className="font-serif text-5xl text- mt-20  focus:outline-none" onChange={(e)=>setTitle(e.target.value)} />
            {/* Description */}
            <Tiptap  setEditor={setEditor}/>
        </div>

    </div>)
    
}


