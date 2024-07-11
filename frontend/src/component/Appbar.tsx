import Avatar from "./Avatar";

export function Appbar(email:any) : JSX.Element{

    return (
        <div className="flex justify-between items-center bg-white border-b p-2">
            <div>
                <img className="flex-none cursor-pointer h-10"  alt="" src="src/assets/medium.png"/>
            </div>
            <div>


            <span className="flex items-center"><Avatar name="sumit" size={38}/></span>

            </div>
           
        </div>
    )
    
}