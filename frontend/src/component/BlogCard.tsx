import Avatar from "./Avatar";


export function BlogCard({post}: any): JSX.Element {
  const time: number = Math.floor(Math.random() * 10) + 1;

 const url: string = "https://random.imagecdn.app/150/150";

  const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const date = new Date(post.createdAt);
  const month = date.getMonth();
  const monthString = month_names_short[month];
  const day = date.getDate();
  const year = date.getFullYear();

  return (
    <div className="flex justify-center items-center">
    <div className="flex border-b border-gray-200 w-7/12 ">
      {/* Blog card */}
      <div className="flex-grow p-6">
        <div className="flex items-center mb-2">
          <span className="mr-2"><Avatar name={post.User.username} size={32}/></span>
          <span className="text-sm font-medium mr-1">{post.User.username}</span>
          <span className="text-sm text-gray-500">{`• ${monthString} ${day}, ${year}`}</span>
        </div>
        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <p className="text-gray-700 mb-4 overflow-hidden line-clamp-3">{post.description}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{time} min read</span>
          <div className="flex">
            {/* Icons */}
            <div className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            </div>
            <div className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Blog image */}
      <div className="w-36 h-36 flex-shrink-0 self-center mr-6">
        <img src={url} alt="Blog post image" className="w-full h-full object-cover" />
      </div>
    </div>
    </div>
  );
}