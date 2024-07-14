import { Heading } from "../component/Heading";
import { Warning } from "../component/Warning";
import { Inputbox } from "../component/Inputbox";
import { Button } from "../component/Button";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Quotes } from "../component/Quotes";

export const Signup = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    return (
        // Whole screen
        <div className=" flex justify-around ">
           
        {/* Signup form */}
        <div className="h-screen w-screen  flex justify-center items-center  bg-blend-luminosity">
            <div className="rounded-md shadow-xl w-8/12 h-fit bg-white p-8 ">
                <Heading label={"Create an account"}></Heading>
                <Warning label={"Already have an account?"} buttonText={"Login"} to={"/signin"}></Warning>
                <Inputbox label={"Username"} placeholder={"Enter your name"} onChange={(e : React.ChangeEvent<HTMLInputElement>)=>{setName((e.target.value))}} type={"text"}></Inputbox>
                <Inputbox label={"Email"} placeholder={"Enter your email"} onChange={(e : React.ChangeEvent<HTMLInputElement>)=>{setEmail((e.target.value))}} type={"text"}></Inputbox>
                <Inputbox label={"Password"} placeholder={"Enter your password"} onChange={(e : React.ChangeEvent<HTMLInputElement>)=>{setPassword((e.target.value))}} type={"password"}></Inputbox>
                <Button label={"Sign up"} onClick={ async ()=>{
                     try{

                        //Sending request to backend
                        const response  =  await axios.post("https://backend.sumitbhuia.workers.dev/api/v1/users/signup",
                            {
                                username : name,
                                email : email,
                                password : password
                            }
                        )
                        // console.log(response);


                        //Received response has auth token 
                        localStorage.setItem("token",response.data.token);
                        navigate("/blogs"  , { state: { username: name}})

                     }catch(error){

                     }
                    
                } }></Button>


            </div>
        </div>

        {/* Random quotes */}
        <div className="h-screen w-screen bg-slate-50 flex justify-center items-center ">
           <Quotes></Quotes>
        </div>



        </div>
    )
}