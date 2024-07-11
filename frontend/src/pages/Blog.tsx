import axios from "axios";
import {BlogCard} from "../component/BlogCard";
import { useEffect, useState } from "react";
import * as Spinners from "react-loader-spinner";
import { Appbar } from "../component/Appbar";
import { useLocation } from "react-router-dom";


interface BlogProps {
    username: string;
    createdAt: string;
    title: string;
    description: string;
    id:number;
}


export const Blog = () => {
    const [posts , setPosts] = useState<BlogProps[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const email : string = location.state.email.toString();

   useEffect(()=>{
    const getPosts = async () =>{
        try{
            const response = await axios.get("https://backend.sumitbhuia.workers.dev/api/v1/blog/allPosts");
            setPosts(response.data);
        }
    
        catch(error){
            console.log("bhai galt hai ",error);
        }
        finally{
            setLoading(false);
        }
    };
    getPosts();
   },[]) 

   if (loading) {
    return <div className="flex justify-center items-center h-screen w-screen">
              {loading && (
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

console.log(typeof(email));
return <div className="p-2">
<Appbar email={email}></Appbar>
<div className="h-fit w-screen  flex justify-center items-center  bg-white">
        <div>
            {posts.map(it => <BlogCard  key={it.id} post={it} />)}
        </div>
    </div>
    </div>;
}