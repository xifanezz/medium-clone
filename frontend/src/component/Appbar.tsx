import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import * as Icons from '../Icons'

interface AppbarProps {
    name: string;
}

// Without {} destructuring 
// console.log(name) ->{name: "Sumit Bhuia"}
// console.log(name.name) -> Sumit Bhuia
// With {} destructuring
// console.log(name) -> {"Sumit Bhuia"}
export function Appbar({name}:AppbarProps) : JSX.Element{
    const navigate = useNavigate();
    return (
        <div className="flex justify-between items-center bg-white border-b p-2">
            <div>
                <img className="flex-none justify-center items-center cursor-pointer h-10"  alt="Medium" src="/src/assets/medium.png"/>
            </div>
            <div>

            <div className="flex justify-center items-center text-gray-600">
                {/* Create button on home page */}
                <button className="mr-10 flex" onClick={()=>{ navigate('/publish')}}> 
                    <span className="mr-1">Write</span>
                    <Icons.Create/>
                   
                </button>
                <span className="flex items-center"><Avatar name={name} size={38}/></span>
            </div>


            </div>
           
        </div>
    )
    
}