import Avatar from "./Avatar";
import * as Icons from "../Icons";
// import { handleEditorContent } from "./Tiptap";

interface PublishBarProps {
    name: string;
    onPublish: () => void;
  }

// Without {} destructuring 
// console.log(name) ->{name: "Sumit Bhuia"}
// console.log(name.name) -> Sumit Bhuia
// With {} destructuring
// console.log(name) -> {"Sumit Bhuia"}
export function PublishBar({name, onPublish}:PublishBarProps) : JSX.Element{

//  const save = handleEditorContent();

    return (
        <div className="flex justify-between items-center bg-white">
            <div>
                <img className="flex-none cursor-pointer h-7"  alt="" src="src/assets/mediumText.png "/>
            </div>
            <div>

                <div className="flex justify-center items-center text-gray-600">
                    {/* Publish page  pusblish button */}
                    <button className="mr-4 flex  justify-center items-center p-3 py-4 rounded-full w-20 h-6 bg-green-600 text-sm text-white" onClick={onPublish}> 
                        Publish
                    </button>
                    {/* Options icon */}
                    <Icons.Options />
                    {/* Bell icon */}
                    <Icons.Bell />
                    
                    {/* Avatar */}
                    <span className="flex items-center"><Avatar name={name} size={38}/></span>
                </div>


            </div>
           
        </div>
    )
    
}