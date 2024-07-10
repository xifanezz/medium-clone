interface HeadingProps {
    label : string;
}

export function Heading({label} : HeadingProps) : JSX.Element{

    return(
    <div className="text-4xl font-bold text-center mt-4 text-gray-900">
        {label}
    </div>
    )
}