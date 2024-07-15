import { useParams } from "react-router-dom";
import { Appbar } from "../component/Appbar";
import Avatar from "../component/Avatar";
import { useEffect, useState } from "react";
import parse from 'html-react-parser';
import axios from "axios";
import DOMPurify from 'dompurify';
import * as Spinners from "react-loader-spinner";


interface BlogProp {
    title: string;
    description: string;
    userId: number;
    id: number;
    createdAt: string;
    User: {
        username: string;
    };
}

export function Blog(): JSX.Element {
    const [blog, setBlog] = useState<BlogProp>();
    const[isLoading, setIsLoading] = useState(true);
    // const name: string = localStorage.getItem("username") || `!`;
    const { id } = useParams<{ id: string }>();
    

    useEffect(() => {
        const getBlog = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`https://backend.sumitbhuia.workers.dev/api/v1/blog/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                setBlog(res.data);
            } catch (error) {
                console.log("Error getting blog", error);
            }
            finally {
                setIsLoading(false);
            }
        };

        getBlog();
    }, [id]);

    const cleanHtml = DOMPurify.sanitize(blog?.description || "");
    const description = parse(cleanHtml);

    const name = blog?.User.username || "?";
    const month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = blog ? new Date(blog.createdAt) : new Date();
    const month = date.getMonth();
    const monthString = month_names_short[month];
    const day = date.getDate();
    const year = date.getFullYear();

    if(isLoading) {
        return <div className="flex justify-center items-center h-screen w-screen">
              {isLoading && (
        <Spinners.Oval
          visible={true}
          height={50}
          width={50}
          color="#000000"
          secondaryColor = "#000000"
            strokeWidth={3}
            strokeWidthSecondary={4}
          ariaLabel="oval-loading"

          wrapperStyle={{}}
          wrapperClass=""
        />
      )}

    </div>;
    }

    return (
        <div className="px-10 py-3">
        <Appbar name={localStorage.getItem("username")||""} />
        <div className="container mx-auto p-6 grid grid-cols-12 gap-6 ">
            <div className="col-span-8">
                <div className="font-serif text-5xl mt-8 mb-4">{blog?.title}</div>
                <div className="text-gray-600 text-md mb-6">{`${monthString} ${day}, ${year}`}</div>
                {/* Render parsed description */}
                <div className="description">{description}</div>
            </div>
            <div className="col-span-4 flex flex-col items-center">
                <div className="flex items-center space-x-3 mb-4">
                    <Avatar name={name} size={38} />
                    <span className="font-medium text-lg">{name}</span>
                </div>
                <div className="text-left text-gray-500">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                </div>
            </div>
        </div>
    </div>
);
}

