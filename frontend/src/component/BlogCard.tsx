import  Avatar  from "./Avatar";

interface BlogCardProps {
    name: string;
    createdAt: string;
    title: string;
    description: string;
    readTime: number;

}

export function BlogCard({ name, createdAt, title, description,readTime}: BlogCardProps): JSX.Element {
    return (
        <div className="max-w-2xl border-b border-gray-200 p-10 pb-4 mb-4">
            <div className="flex items-center mb-2">
                 <span className="mr-3"><Avatar name={name} size={32}/></span>
                <span className="text-sm font-medium mr-2">{name}</span>
                <span className="text-sm text-gray-500">{createdAt}</span>
                {/* {isMemberOnly && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Member-only</span>
                )} */}
            </div>
            <h2 className="text-xl font-bold mb-1">{title}</h2>
            <p className="text-gray-700 mb-2">{description}</p>
            <div className="flex items-center text-sm text-gray-500">
                <span>{readTime} min read</span>
            </div>
        </div>
    );
}