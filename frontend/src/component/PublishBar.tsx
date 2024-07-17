import Avatar from "./Avatar";
import * as Icons from "../Icons";
import { Link } from "react-router-dom";
import mediumText from '../../public/mediumText.png'

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
            <Link to={"/blogs"}><div>
                <img className="flex-none cursor-pointer h-4 sm:h-5 md:h-6 lg:h-7"  alt="" src={mediumText}/>
            </div></Link>
            <div>

                <div className="flex justify-center items-center text-gray-600">
                    {/* Publish page  pusblish button */}
                    <button className="mr-4 flex  justify-center items-center  sm:py-2 md:py-3 lg:py-4 sm:px-1 md:px-2 lg:px-3 rounded-full w-20 h-6  bg-green-500 hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring focus:ring-green-300  text-sm text-white   "  onClick={onPublish}> 
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