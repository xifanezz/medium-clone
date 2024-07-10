import { Link } from "react-router-dom"


interface WarningProps {
  label : string;
  buttonText : string;
  to : string;
}
export function Warning({label, buttonText ,to}:WarningProps) : JSX.Element{
    return <div className="pt-3 pb-6 text-sm flex justify-center">
      <div className="text-gray-600">
        {label}
      </div>
      <Link className="underline text-grey-500 pl-1 cursor-pointer" to={to}>
        {buttonText}
      </Link>
    </div>
}
  